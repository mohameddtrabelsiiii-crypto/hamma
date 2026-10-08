import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseCsv,readLocations,planSearches,csvRows,collectResults,callPublicwww,DEFAULT_FOOTPRINTS} from './publicwww-export.mjs';

test('reads client towns, area codes and multi-postcode CSV without losing quoted fields',()=>{
 const places=readLocations('town,phone_code,postcodes\r\nShrewsbury,01743,"SY1|SY2|SY3"\r\n"Kingston, Surrey",020,"KT1;KT2"\r\n');
 assert.deepEqual(places[0],{town:'Shrewsbury',phone_code:'01743',postcodes:['SY1','SY2','SY3']});
 assert.deepEqual(places[1],{town:'Kingston, Surrey',phone_code:'020',postcodes:['KT1','KT2']});
 assert.throws(()=>readLocations('town,phone_code\nShrewsbury,01743'),/postcodes/);
 assert.throws(()=>readLocations('town,phone_code,postcodes\nShrewsbury,01743,"SY1"broken'),/Malformed/);
 assert.equal(DEFAULT_FOOTPRINTS.length,14);
});
test('planned API queries preserve verified PublicWWW syntax and dedupe identical combinations',()=>{
 const places=[{town:'Shrewsbury',phone_code:'01743',postcodes:['SY1']}];
 const queries=planSearches([...places,...places],['Web design by Yell','Powered by Yell']);
 assert.equal(queries.length,6);
 assert.equal(queries[0].query,'depth:all site:uk "Web design by Yell" "Shrewsbury"');
 assert.equal(queries[1].query,'depth:all site:uk "Web design by Yell" "01743"');
 assert.match(queries[5].query,/"SY1"$/);
});
test('CSV output quotes formula-looking values and embedded separators',()=>{
 const text=csvRows([['domain','notes'],['example.test','=HYPERLINK("https://bad.test")'],['mail.test','  +1+1'],['site.test','a,b']]);
 assert.match(text,/"'=HYPERLINK/);
 assert.match(text,/"'  \+1\+1"/);
 assert.deepEqual(parseCsv(text).rows[1],['mail.test',"'  +1+1"]);
 assert.deepEqual(parseCsv(text).rows[2],['site.test','a,b']);
});
test('aggregates across footprint queries, flags truncation, rejects malformed URLs',()=>{
 const plan=[
 {query:'a',town:'Shrewsbury',term:'SY1',footprint:'Powered by Yell'},
 {query:'b',town:'York',term:'YO1',footprint:'Web design by Hibu'}
 ];
 const page=[
 {results:[{domain:'FOO.CO.UK',url:'https://foo.co.uk/a',rank:null},{domain:'bad.test',url:'javascript:alert(1)',rank:1}],truncated:false},
 {results:[{domain:'foo.co.uk',url:'https://foo.co.uk/b',rank:105}],truncated:true}
 ];
 const result=collectResults(plan,page);
 assert.equal(result.data.length,1);
 assert.equal(result.data[0].domain,'foo.co.uk');
 assert.equal(result.data[0].rank,105);
 assert.deepEqual(result.data[0].locations,'Shrewsbury | York');
 assert.equal(result.data[0].matches,2);
 assert.equal(result.data[0].queries,'a | b');
 assert.equal(result.data[0].review_status,'Manual website verification required');
 assert.equal(result.issues.length,2);
});
test('API implementation pages through results, never calls live provider in tests',async()=>{
 const requests=[];
 const fetcher=async url=>{
  requests.push(url.href);
  const p=Number(url.searchParams.get('page'));
  assert.equal(url.hostname,'api.publicwww.com');
  assert.equal(url.searchParams.get('query'),'"Web design by Yell"');
  return Response.json({results:p===1?[{domain:'a.co.uk',url:'https://a.co.uk',rank:1}]:[],truncated:false,total_pages:2});
 };
 const resp=await callPublicwww('"Web design by Yell"',{key:'test-only',perPage:1,maxPages:2,fetcher});
 assert.equal(resp.results.length,1);
 assert.equal(requests.length,2);
 assert.equal(resp.truncated,false);
 await assert.rejects(callPublicwww('',{key:'',perPage:100,maxPages:1}),/API key required/);
});
test('rate limit honours retry-after but quota exhaustion terminates without endless requests',async()=>{
 let calls=0,wait=0;
 const success=await callPublicwww('A',{key:'fake',perPage:10,fetcher:async()=>{
  calls++;
  if(calls===1)return Response.json({error:{code:'too_many_requests',message:'slow down'}},{status:429,headers:{'Retry-After':'2'}});
  return Response.json({results:[],total_pages:0,truncated:false});
 },sleeper:async ms=>{wait+=ms}});
 assert.equal(success.results.length,0);
 assert.equal(wait,2000);
 assert.equal(calls,2);
 let quotaCalls=0;
 await assert.rejects(callPublicwww('A',{key:'fake',fetcher:async()=>{quotaCalls++;return Response.json({error:{code:'quota_exceeded'}},{status:429})}}),/quota exhausted/);
 assert.equal(quotaCalls,1);
});
