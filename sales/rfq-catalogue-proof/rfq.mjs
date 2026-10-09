// TaskForge AI | synthetic RFQ catalogue-check proof (Node 20+).
// Offline CSV-only demonstration, NOT a customer quote or PDF/n8n integration.
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const norm=x=>String(x??'').trim().toUpperCase();
const str=x=>String(x??'');
const cell=x=>{const t=str(x);const s=/^[\s\u0000-\u001f]*[=+@-]/.test(t)?"'"+t:t;return '"'+s.replaceAll('"','""')+'"';};
export const FIELDS=['line','sku','description','quantity','unit','approved_price','currency','amount','status','reason'];
export function exportCsv(rows,cols=FIELDS){return [cols.map(cell).join(','),...rows.map(r=>cols.map(k=>cell(r[k])).join(','))].join('\r\n')+'\r\n';}
export function parseCsv(source){
 if(typeof source!=='string'||Buffer.byteLength(source)>1000000)throw Error('Input must be UTF-8 text <=1 MB');
 const text=source.replace(/^\uFEFF/,'');
 let rows=[],row=[],field='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"'){quoted=false;closed=true;}else field+=c;}
  else if(c===','||c==='\r'||c==='\n'){
   row.push(field);field='';closed=false;
   if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(x=>x!==''))rows.push(row);row=[];if(rows.length>2001)throw Error('Row limit exceeded');}
  }else if(c==='"'&&field===''&&!closed)quoted=true;
  else if(c==='"'||closed)throw Error('Malformed CSV');
  else field+=c;
 }
 if(quoted)throw Error('Unclosed CSV quote');
 if(field||row.length){row.push(field);rows.push(row);}
 if(!rows.length)throw Error('Missing headers');
 const headers=rows.shift().map(x=>x.trim());
 if(headers.some(x=>!x)||new Set(headers).size!==headers.length)throw Error('Invalid headers');
 if(rows.some(r=>r.length!==headers.length))throw Error('CSV column mismatch');
 return rows.map(r=>Object.fromEntries(headers.map((key,i)=>[key,r[i]])));
}
const minor=value=>{
 const m=str(value).trim().match(/^(0|[1-9]\d{0,9})(?:\.(\d{1,2}))?$/);
 return m?BigInt(m[1])*100n+BigInt((m[2]||'').padEnd(2,'0')):null;
};
const amount=x=>str(x/100n)+'.'+str(x%100n).padStart(2,'0');
export function quote(rfq,catalogue){
 const required=(a,keys)=>{if(!Array.isArray(a)||a.length>2000||a.some(r=>!r||keys.some(k=>!(k in r))))throw Error('Missing fields or too many rows: '+keys.join(','));};
 required(rfq,['sku','description','quantity','unit']);
 required(catalogue,['sku','description','unit','unit_price','currency']);
 const idx=new Map();
 for(const c of catalogue){const sku=norm(c.sku);if(sku)idx.set(sku,[...(idx.get(sku)||[]),c]);}
 let total=0n;const all=[],review=[],seen=new Set();
 for(const [i,item] of rfq.entries()){
  const sku=norm(item.sku),unit=norm(item.unit),q=str(item.quantity).trim(),problems=[];
  const quantity=/^[1-9]\d{0,5}$/.test(q)?BigInt(q):null;
  if(!sku)problems.push('missing_sku');
  if(!unit)problems.push('missing_unit');
  if(quantity===null)problems.push('invalid_quantity');
  const key=[sku,norm(item.description),unit,q].join('|');
  if(seen.has(key))problems.push('duplicate_rfq_line');seen.add(key);
  const matches=idx.get(sku)||[];
  if(matches.length===0)problems.push('unknown_sku');
  if(matches.length>1)problems.push('duplicate_catalogue_sku');
  const c=matches.length===1?matches[0]:null;
  if(c&&norm(c.unit)!==unit)problems.push('unit_mismatch');
  const price=c?minor(c.unit_price):null;
  if(c&&price===null)problems.push('invalid_approved_price');
  const currency=c?norm(c.currency):'';
  if(c&&!/^[A-Z]{3}$/.test(currency))problems.push('invalid_currency');
  const sum=problems.length===0?price*quantity:null;
  if(sum!==null)total+=sum;
  const result={line:i+1,sku:item.sku,description:item.description,quantity:item.quantity,unit:item.unit,approved_price:sum===null?'':amount(price),currency:sum===null?'':currency,amount:sum===null?'':amount(sum),status:problems.length?'REVIEW':'DRAFT_MATCH',reason:problems.join(';')};
  all.push(result);if(problems.length)review.push(result);
 }
 const currencies=new Set(all.filter(r=>r.status==='DRAFT_MATCH').map(r=>r.currency));
 if(currencies.size>1){for(const r of all.filter(r=>r.status==='DRAFT_MATCH')){r.status='REVIEW';r.reason='mixed_currencies';r.amount='';r.approved_price='';review.push(r);}}
 const complete=all.length>0&&review.length===0&&currencies.size===1;
 return {rows:all,exceptions:review,complete,total:complete?amount(total):null,currency:complete?[...currencies][0]:null};
}
async function main(){
 if(process.argv.length!==5)throw Error('Usage: node rfq.mjs rfq.csv approved_catalogue.csv output_prefix');
 const [a,b,prefix]=process.argv.slice(2);
 const [rfq,cat]=await Promise.all([readFile(a,'utf8'),readFile(b,'utf8')]);
 const result=quote(parseCsv(rfq),parseCsv(cat));
 await Promise.all([writeFile(prefix+'-draft.csv',exportCsv(result.rows)),writeFile(prefix+'-review.csv',exportCsv(result.exceptions))]);
 console.log(JSON.stringify({rows:result.rows.length,needsReview:result.exceptions.length,complete:result.complete,total:result.total,currency:result.currency}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e.message);process.exitCode=1;});
