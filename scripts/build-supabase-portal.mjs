import {readFile, mkdir, writeFile} from 'node:fs/promises';

const source=await readFile(new URL('../worker.js',import.meta.url),'utf8');
const listener="addEventListener('fetch',event=>event.respondWith(handle(event.request)));";
if(!source.trimEnd().endsWith(listener))throw new Error('Unexpected Worker entrypoint; refusing unverified conversion.');
const prefix='/functions/v1/taskforge-public';
let script=source.trimEnd().slice(0,-listener.length);
script=script.replaceAll("fetch('/api/","fetch('"+prefix+"/api/");
script=script.replaceAll('href="/?service=','href="'+prefix+'/?service=');
script=script.replaceAll('href="/"','href="'+prefix+'/');
script += [
'',
"const PUBLIC_PREFIX='"+prefix+"';",
'Deno.serve(request=>{',
' const url=new URL(request.url);',
' if(!(url.pathname===PUBLIC_PREFIX||url.pathname.startsWith(PUBLIC_PREFIX+"/")))return new Response("Not found",{status:404});',
' const path=url.pathname.slice(PUBLIC_PREFIX.length)||"/";',
' url.pathname=path;',
' return handle(new Request(url,request));',
'});',''
].join('\n');
const out=new URL('../dist/taskforge-public/',import.meta.url);
await mkdir(out,{recursive:true});
await writeFile(new URL('index.mjs',out),script,'utf8');
console.log('Generated isolated Supabase portal from the production Worker source.');