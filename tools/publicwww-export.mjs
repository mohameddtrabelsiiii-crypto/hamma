#!/usr/bin/env node
/**
 * TaskForge PublicWWW location-footprint export (client-funded, API-key required).
 * Node 22+ and zero npm dependencies. Safe by default: DRY RUN unless --execute.
 * PublicWWW's API requires a paid plan. No search is attempted without consent.
 *
 * Usage:
 * node tools/publicwww-export.mjs --locations tools/publicwww-locations.example.csv
 * PUBLICWWW_API_KEY=... node tools/publicwww-export.mjs --locations locations.csv --execute --max-queries 10 --max-pages 2
 *
 * Official API https://publicwww.com/docs/api/ and /docs/api/requests/
 */
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export const DEFAULT_FOOTPRINTS=Object.freeze([
  'business.yell.com/websites-privacy-cookie-policy/',
  'business.yell.com/legal/terms-of-use/',
  'business.yell.com/legal/trading-terms/',
  'The content on this website is owned by us and our licensors',
  'Do not copy any content (including images) without our consent',
  'Web design by Yell',
  'Web design by Hibu',
  'Powered by Yell Business',
  'Powered by Yell',
  'Powered by Hibu',
  'yell.multiscreensite.com',
  'dd-cdn.multiscreensite.com/yell/html/terms-and-conditions.html',
  '© Yell (UK) Limited',
  '© hibu (UK) Limited'
]);

export function parseCsv(text) {
  if(typeof text!=='string'||text.length>2*1024*1024) throw new Error('CSV too large (2 MB max)');
  text=text.replace(/^\uFEFF/,'');
  const rows=[];let row=[],cell='',quoted=false,justClosed=false;
  const finishCell=()=>{if(cell.length>20000)throw Error('CSV cell over 20K characters');row.push(cell);cell='';justClosed=false;if(row.length>40)throw Error('Too many columns')};
  const finishRow=()=>{finishCell();if(row.some(x=>x.trim()))rows.push(row);row=[];if(rows.length>1001)throw Error('Too many location rows')};
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++}else{quoted=false;justClosed=true}}else cell+=c;continue}
    if(c==='"'){if(cell||justClosed)throw Error('Malformed CSV quote');quoted=true;continue}
    if(c===','){finishCell();continue}
    if(c==='\n'||c==='\r'){finishRow();if(c==='\r'&&text[i+1]==='\n')i++;continue}
    if(justClosed)throw Error('Malformed CSV after quote');
    cell+=c;
  }
  if(quoted)throw Error('CSV has unclosed quoted field');
  if(cell||row.length||justClosed)finishRow();
  if(!rows.length)throw Error('CSV has no header');
  const header=rows.shift().map(x=>x.trim().toLowerCase().replace(/[\s-]+/g,'_'));
  if(new Set(header).size!==header.length)throw Error('Duplicate CSV headers');
  for(const row of rows)if(row.length!==header.length)throw Error('Inconsistent number of columns');
  return {header,rows};
}
function cleanTerm(s){
  const value=String(s||'').trim();
  if(!value)return '';
  if(value.length>90||/[\r\n\x00-\x1f]/.test(value))throw Error('Invalid town/code/postcode district');
  return value;
}
export function readLocations(csvText){
  const {header,rows}=parseCsv(csvText);
  const get=(r,...keys)=>{const index=header.findIndex(x=>keys.includes(x));return index<0?'':r[index]};
  if(!header.includes('town')||!header.some(x=>['phone_code','telephone_area_code','area_code'].includes(x))||!header.some(x=>['postcodes','postcode_districts','postcode'].includes(x)))throw Error('CSV needs town, phone_code, postcodes header');
  return rows.map(row=>{
    const town=cleanTerm(get(row,'town'));
    const phone_code=cleanTerm(get(row,'phone_code','telephone_area_code','area_code'));
    const postcodes=get(row,'postcodes','postcode_districts','postcode').split(/[|;]/).map(cleanTerm).filter(Boolean);
    if(!town)throw Error('Every row needs a town');
    if(postcodes.length>25)throw Error('Too many postcodes');
    if(!phone_code&&!postcodes.length)throw Error('Every town needs a phone code or postcode');
    return {town,phone_code,postcodes};
  });
}
function quoteTerm(value){return '"'+String(value).replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"'}
export function planSearches(locations,footprints=DEFAULT_FOOTPRINTS){
  const result=[],seen=new Set();
  for(const loc of locations){
    const terms=[loc.town,loc.phone_code,...loc.postcodes].filter(Boolean);
    for(const footprint of footprints){
      if(typeof footprint!=='string'||!footprint.trim()||footprint.length>250)throw Error('Invalid footprint');
      for(const term of terms){
        const query='depth:all site:uk '+quoteTerm(footprint)+' '+quoteTerm(term);
        if(seen.has(query))continue;
        seen.add(query);
        result.push({query,town:loc.town,term,footprint});
        if(result.length>10000)throw Error('Too many possible queries');
      }
    }
  }
  return result;
}
export function csvCell(value){
  const s=String(value??'');
  const guarded=/^[\s]*[=+\-@\t\r]/.test(s)?"'"+s:s;
  return '"'+guarded.replace(/"/g,'""')+'"';
}
export function csvRows(rows){return rows.map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n'}
function validSite(row){
  if(!row||typeof row!=='object')return null;
  let u;try{u=new URL(row.url)}catch{return null}
  if(!['http:','https:'].includes(u.protocol)||u.username||u.password)return null;
  const domain=(typeof row.domain==='string'?row.domain:u.hostname).trim().toLowerCase().replace(/\.$/,'');
  if(!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain))return null;
  if(!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u.hostname))return null;
  const rank=row.rank===null||row.rank===undefined?'':(Number.isSafeInteger(row.rank)&&row.rank>=0?row.rank:'');
  return {domain,url:u.href,rank};
}
export function collectResults(plan,responses){
  const found=new Map(),issues=[];
  for(let i=0;i<responses.length;i++){
    const page=responses[i],item=plan[i];
    if(!item||!page)continue;
    if(!Array.isArray(page.results))throw Error('Malformed PublicWWW search response');
    if(page.truncated)issues.push({query:item.query,warning:'API search truncated; plan limits or tier restricted results'});
    for(const raw of page.results){
      const site=validSite(raw);
      if(!site){issues.push({query:item.query,warning:'Rejected unsafe/invalid API URL'});continue}
      const current=found.get(site.domain)||{...site,locations:new Set(),footprints:new Set(),terms:new Set(),matches:0};
      current.locations.add(item.town);current.footprints.add(item.footprint);current.terms.add(item.term);
      current.matches++;
      if(site.rank!==''&&(current.rank===''||site.rank<current.rank)){current.rank=site.rank;current.url=site.url}
      found.set(site.domain,current);
    }
  }
  const data=[...found.values()].sort((a,b)=>a.domain.localeCompare(b.domain)).map(item=>({
    domain:item.domain,url:item.url,rank:item.rank,locations:[...item.locations].join(' | '),
    footprints:[...item.footprints].join(' | '),terms:[...item.terms].join(' | '),
    matches:item.matches,review_status:'Manual website verification required'
  }));
  return {data,issues};
}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function callPublicwww(query,{key,perPage=100,maxPages=1,fetcher=fetch,sleeper=sleep}={}){
  if(!key)throw Error('API key required; do not run searches on an unfunded plan');
  if(!Number.isInteger(perPage)||perPage<1||perPage>1000)throw Error('perPage must be 1–1000');
  if(!Number.isInteger(maxPages)||maxPages<1||maxPages>30)throw Error('maxPages must be 1–30');
  const responses=[];
  for(let page=1;page<=maxPages;page++){
    const url=new URL('https://api.publicwww.com/v1/search');
    url.searchParams.set('query',query);url.searchParams.set('page',String(page));
    url.searchParams.set('per_page',String(perPage));url.searchParams.set('snippets','0');
    let response,json;
    for(let retry=0;retry<4;retry++){
      response=await fetcher(url,{headers:{Authorization:'Bearer '+key,Accept:'application/json'},signal:AbortSignal.timeout(20000)});
      json=await response.json();
      if(response.status!==429)break;
      const code=json?.error?.code;
      if(code==='quota_exceeded')throw Error('PublicWWW quota exhausted: stop, do not silently return partial data');
      if(code!=='too_many_requests')throw Error('PublicWWW rejected request, HTTP 429');
      if(retry===3)throw Error('PublicWWW rate limit retry cap reached');
      const seconds=Math.max(1,Math.min(120,Number(response.headers.get('Retry-After'))||30));
      await sleeper(seconds*1000);
    }
    if(!response.ok)throw Error('PublicWWW API HTTP '+response.status+' '+String(json?.error?.code||'failure'));
    if(!json||!Array.isArray(json.results)||typeof json.truncated!=='boolean')throw Error('Malformed PublicWWW JSON response');
    responses.push(json);
    if(json.results.length<perPage||page>=json.total_pages)break;
  }
  return {results:responses.flatMap(x=>x.results),truncated:responses.some(x=>x.truncated)||responses.length>=maxPages&&responses.at(-1)?.total_pages>maxPages};
}
function argsParse(argv){
  const arg={execute:false,maxQueries:10,maxPages:1,perPage:100,output:'publicwww-results.csv'};
  for(let i=0;i<argv.length;i++){
    const flag=argv[i];
    if(flag==='--execute')arg.execute=true;
    else if(['--locations','--out','--max-queries','--max-pages','--per-page'].includes(flag)){
      const raw=argv[++i];if(!raw||raw.startsWith('--'))throw Error('Missing value for '+flag);
      if(flag==='--locations')arg.locations=raw;
      if(flag==='--out')arg.output=raw;
      if(flag==='--max-queries')arg.maxQueries=Number(raw);
      if(flag==='--max-pages')arg.maxPages=Number(raw);
      if(flag==='--per-page')arg.perPage=Number(raw);
    }else throw Error('Unknown argument '+flag);
  }
  if(!arg.locations)throw Error('Use --locations your-locations.csv');
  if(!Number.isInteger(arg.maxQueries)||arg.maxQueries<1||arg.maxQueries>200)throw Error('Max queries must be 1–200');
  return arg;
}
export async function main(argv=process.argv.slice(2)){
  const arg=argsParse(argv);
  const locations=readLocations(await readFile(resolve(arg.locations),'utf8'));
  const plan=planSearches(locations);
  if(!plan.length)throw Error('No queries generated');
  const capped=plan.slice(0,arg.maxQueries);
  const planCsv=csvRows([['query','town','term','footprint'],...capped.map(p=>[p.query,p.town,p.term,p.footprint])]);
  await writeFile(resolve(arg.output+'.plan.csv'),planCsv,'utf8');
  if(!arg.execute){
    console.log('DRY RUN only. '+plan.length+' total query combinations. Planned '+capped.length+'. No API called. Proposed plan: '+arg.output+'.plan.csv');
    console.log('PublicWWW requires a PAID plan; client must authorize paid searches and supply its own API key.');
    return;
  }
  const key=process.env.PUBLICWWW_API_KEY;
  if(!key)throw Error('--execute needs client-provided PUBLICWWW_API_KEY; never commit the key');
  const pages=[];let completed=0;
  for(const item of capped){
    try{
      pages.push(await callPublicwww(item.query,{key,perPage:arg.perPage,maxPages:arg.maxPages}));
      completed++;
    }catch(e){
      const {data,issues}=collectResults(capped.slice(0,completed),pages);
      await writeFile(resolve(arg.output),csvRows([['domain','match_url','rank','matched_towns','matched_footprints','matched_terms','match_count','review_status'],...data.map(d=>[d.domain,d.url,d.rank,d.locations,d.footprints,d.terms,d.matches,d.review_status])]),'utf8');
      await writeFile(resolve(arg.output+'.report.json'),JSON.stringify({status:'partial_failure',completed,totalPlanned:plan.length,reason:String(e.message),issues,neverTreatAsComplete:true},null,2),'utf8');
      throw e;
    }
  }
  const {data,issues}=collectResults(capped,pages);
  await writeFile(resolve(arg.output),csvRows([['domain','match_url','rank','matched_towns','matched_footprints','matched_terms','match_count','review_status'],...data.map(d=>[d.domain,d.url,d.rank,d.locations,d.footprints,d.terms,d.matches,d.review_status])]),'utf8');
  const incomplete=issues.length>0||capped.length!==plan.length;
  await writeFile(resolve(arg.output+'.report.json'),JSON.stringify({status:incomplete?'partial':'completed',queriesAttempted:completed,totalPossibleQueries:plan.length,uniqueDomains:data.length,issues,manualReviewRequired:true},null,2),'utf8');
  console.log('Finished '+completed+' authorized API queries and '+data.length+' unique domains. '+(incomplete?'PARTIAL: see report.':'See report.')+' Never assume results are manually verified.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  main().catch(e=>{console.error(e.message);process.exitCode=1});
}
