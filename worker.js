const HTML="<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>TaskForge AI \u2014 AI Work Delivered</title><meta name=\"description\" content=\"TaskForge AI delivers fixed-scope digital work.\"><link rel=\"canonical\" href=\"https://taskforge-ai.pages.dev/\"><style>body{font-family:system-ui;margin:0;background:#0b1020;color:#f7f8fc}main{max-width:1000px;margin:auto;padding:64px 22px}.hero{max-width:760px}h1{font-size:clamp(42px,7vw,76px);line-height:.95;margin:0 0 18px}p{color:#b9c0d4;line-height:1.6}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin:34px 0}.card,.box{border:1px solid #27304a;border-radius:18px;padding:22px;background:#11182b}.box{max-width:700px}input,textarea,select{width:100%;box-sizing:border-box;margin:7px 0 12px;padding:13px;border-radius:10px;border:1px solid #35405d;background:#0a1020;color:white}button{padding:13px 18px;border:0;border-radius:10px;font-weight:700}.muted{font-size:13px;color:#8992aa}#msg{margin-top:12px;color:#9fe6b8}label{display:block;margin-top:12px}button:disabled{opacity:.6}a{color:#9fe6b8}:focus-visible{outline:3px solid #9fe6b8;outline-offset:3px}</style></head><body><main><section class=\"hero\"><div class=\"muted\">TASKFORGE AI \u00b7 GLOBAL DIGITAL OPERATIONS</div><h1>AI work.<br>Delivered.</h1><p>Fixed-scope digital work for companies, founders and professionals. Clear intake, verified output, fast delivery.</p></section><section class=\"grid\"><div class=\"card\"><h3>PDF to Excel</h3><p>Convert eligible PDFs into structured spreadsheets with QA.</p></div><div class=\"card\"><h3>Spreadsheet cleanup</h3><p>Clean, normalize and structure spreadsheet data.</p></div><div class=\"card\"><h3>Company list</h3><p>Research and compile company lists with verified results.</p></div><div class=\"card\"><h3>CV writing</h3><p>Create professional CV documents from supplied facts.</p></div></section><section class=\"box\"><h2>Submit your project</h2><p>Choose a service and send your brief. Pricing and delivery time are confirmed after review. No payment is due when you submit.</p><form id=\"order\">\n<label for=\"service\">Service</label><select id=\"service\" name=\"service_slug\" required><option value=\"\">Choose a service</option><option value=\"pdf-to-excel\">PDF to Excel</option><option value=\"spreadsheet-cleanup\">Spreadsheet cleanup</option><option value=\"company-list\">Company list</option><option value=\"cv\">CV writing</option></select>\n<label for=\"name\">Name</label><input id=\"name\" name=\"customer_name\" autocomplete=\"name\" maxlength=\"160\" required>\n<label for=\"email\">Email</label><input id=\"email\" name=\"customer_email\" type=\"email\" autocomplete=\"email\" maxlength=\"254\" required>\n<label for=\"brief\">What do you need delivered?</label><textarea id=\"brief\" name=\"brief\" rows=\"5\" maxlength=\"10000\" required></textarea>\n<label for=\"file\">Supporting file (optional)</label><input id=\"file\" name=\"file\" type=\"file\" accept=\".pdf,.xlsx,.xls,.csv,.docx,.txt,.rtf\" aria-describedby=\"file-help\"><p id=\"file-help\" class=\"muted\">PDF, Excel, CSV, DOCX, TXT or RTF. Maximum 15 MB. Files are stored privately for project review. Upload only files you are authorized to share; do not include passwords or card details.</p>\n<button type=\"submit\">Submit project for review</button><div id=\"msg\" role=\"status\" aria-live=\"polite\"></div></form><p class=\"muted\">Keep your TF reference. Submission does not confirm payment or start delivery.</p></section>\n<section class=\"box\" id=\"account\" style=\"margin-top:28px\"><h2>Your project: status, payment and delivery</h2><p>Sign in with the email used for your project to check its status, review an approved quote or access a checked result. No payment is taken by checking status.</p><form id=\"result-form\"><label for=\"account-email\">Account email</label><input id=\"account-email\" type=\"email\" autocomplete=\"username\" maxlength=\"254\" required><label for=\"account-password\">Password</label><input id=\"account-password\" type=\"password\" autocomplete=\"current-password\" minlength=\"8\" maxlength=\"128\" required><label for=\"order-reference\">Project reference</label><input id=\"order-reference\" placeholder=\"TF-1234ABCD\" pattern=\"TF-[0-9A-Fa-f]{8}\" maxlength=\"11\"><button type=\"submit\">Sign in and get result</button> <button type=\"button\" id=\"create-account\">Create account</button> <button type=\"button\" id=\"pay-order\">Open approved checkout</button> <button type=\"button\" id=\"check-status\">Check project status</button><p id=\"account-msg\" role=\"status\" aria-live=\"polite\"></p><a id=\"result-link\" hidden rel=\"noreferrer\">Download checked CSV</a> <a id=\"payment-link\" hidden rel=\"noreferrer\">Continue to secure Whop checkout</a></form><p class=\"muted\">New account? Create it, confirm your email, then return here. Your password is cleared after each request. Download links expire after one minute.</p></section>\n<script>\nconst form=document.querySelector('#order'),msg=document.querySelector('#msg');\nconst requestedService=new URL(location.href).searchParams.get('service');\nif(['pdf-to-excel','spreadsheet-cleanup','company-list','cv'].includes(requestedService))form.elements.service_slug.value=requestedService;\nform.addEventListener('submit',async event=>{event.preventDefault();const file=form.elements.file.files[0],button=form.querySelector('button');if(file&&file.size>15*1024*1024){msg.textContent='File is too large. Maximum size is 15 MB.';return}button.disabled=true;msg.textContent='Submitting your project\u2026';try{const response=await fetch('/api/order',{method:'POST',body:new FormData(form)});const result=await response.json();if(!response.ok)throw new Error(result.error||'Submission failed.');if(!result.reference)throw new Error('No reference was returned.');msg.textContent='Project received. Your reference is '+result.reference+'. Save this reference. Your project is awaiting scope and price review; no payment has been taken.';form.reset()}catch(error){msg.textContent=error.message+' Your details have been kept. If the connection failed after submission, check with us before sending again.'}finally{button.disabled=false}});\n\nconst resultForm=document.querySelector('#result-form'),accountMsg=document.querySelector('#account-msg'),resultLink=document.querySelector('#result-link');\nconst paymentLink=document.querySelector('#payment-link');\nasync function accountAction(signup,pay=false,statusOnly=false){\n if(!resultForm.reportValidity())return;\n const email=document.querySelector('#account-email').value.trim(),passwordInput=document.querySelector('#account-password'),password=passwordInput.value,reference=document.querySelector('#order-reference').value.trim().toUpperCase();\n if(!signup&&!/^TF-[0-9A-F]{8}$/.test(reference)){accountMsg.textContent='Enter your TF reference from project submission.';return}\n resultLink.hidden=true;resultLink.removeAttribute('href');paymentLink.hidden=true;paymentLink.removeAttribute('href');\n const buttons=[...resultForm.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);accountMsg.textContent=signup?'Creating account\u2026':statusOnly?'Checking your project status\u2026':'Checking your result\u2026';\n try{\n  const response=await fetch(signup?'/api/signup':'/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})});\n  const data=await response.json();if(!response.ok)throw new Error(data.error||'Account request failed.');\n  if(signup){accountMsg.textContent='If registration is available for this email, check your inbox to confirm it, then return here to sign in.';return}\n  if(statusOnly){\n   const statusResponse=await fetch('/api/status',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+data.access_token},body:JSON.stringify({reference})});\n   const project=await statusResponse.json();if(!statusResponse.ok)throw new Error(project.error||'Status unavailable.');\n   const labels={reviewing:'Your brief is awaiting review and pricing. No payment is due.',awaiting_payment:'A quote has been recorded; checkout is available only when payment setup is complete.',paid:'Payment recorded; processing has not finished.',processing:'Your project is being processed.',needs_review:'Your project needs additional quality review.',delivered:'Your checked result is ready. Use Sign in and get result to download.',rejected:'Your project was closed. No download is available.'};\n   accountMsg.textContent='Project '+project.reference+': '+(labels[project.phase]||'Status requires review.')+(Number.isFinite(project.quote_amount_tnd)&&project.quote_amount_tnd>0?' Quote: '+project.quote_amount_tnd+' TND.':'');\n   return;\n  }\n  if(pay){\n   const checkout=await fetch('/api/checkout',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+data.access_token},body:JSON.stringify({reference})});\n   const result=await checkout.json();if(!checkout.ok)throw new Error(result.error||'Checkout unavailable.');\n   const target=new URL(result.purchase_url);if(target.origin!=='https://whop.com'||target.username||target.password)throw new Error('Checkout unavailable.');\n   paymentLink.href=target.href;paymentLink.hidden=false;accountMsg.textContent='Approved quote: '+result.amount+' '+result.currency+'. Continue to Whop to review and pay. Opening this link does not confirm payment.';return;\n  }\n  const download=await fetch('/api/result',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+data.access_token},body:JSON.stringify({reference})});\n  const result=await download.json();if(!download.ok)throw new Error(result.error||'Your result is not available yet.');\n  const target=new URL(result.url);if(target.origin!=='https://epkhqmhhzwlbxxypywau.supabase.co'||!target.pathname.startsWith('/storage/v1/object/sign/'))throw new Error('Download unavailable.');\n  resultLink.href=target.href;resultLink.hidden=false;accountMsg.textContent='Your reviewed CSV is ready. Download it within one minute.';\n }catch(error){accountMsg.textContent=error.message}finally{passwordInput.value='';buttons.forEach(b=>b.disabled=false)}\n}\nresultForm.addEventListener('submit',event=>{event.preventDefault();accountAction(false)});\ndocument.querySelector('#create-account').addEventListener('click',()=>accountAction(true));\ndocument.querySelector('#pay-order').addEventListener('click',()=>accountAction(false,true));\ndocument.querySelector('#check-status').addEventListener('click',()=>accountAction(false,false,true));\n\n</script></main></body></html>";

const SERVICE_DETAILS={
  "/services/pdf-to-excel": {
    "title": "PDF to Excel",
    "description": "Convert eligible PDF tables into spreadsheets with careful quality review. Scanned or ambiguous documents may need additional work.",
    "note": "Data is extracted only from supplied documents. Missing values are never invented."
  },
  "/services/spreadsheet-cleanup": {
    "title": "Spreadsheet cleanup",
    "description": "Organize and clean CSV spreadsheet data while preserving identifiers and flagging risky or ambiguous cells for review.",
    "note": "Eligible deterministic CSV cleanups can be delivered automatically after verified payment; unclear files require review."
  },
  "/services/company-list": {
    "title": "Verified company lists",
    "description": "Request a focused company list for a defined sector, location and selection criteria. Research must be checked against available sources.",
    "note": "We do not fabricate businesses, contact details or research findings."
  },
  "/services/cv-writing": {
    "title": "Professional CV writing",
    "description": "Turn your own work experience and achievements into a clearer professional CV with a defined scope.",
    "note": "Qualifications and job history must come from your supplied information; nothing is invented."
  }
};
function serviceHtml(path,detail){\n const serviceSlug={'/services/pdf-to-excel':'pdf-to-excel','/services/spreadsheet-cleanup':'spreadsheet-cleanup','/services/company-list':'company-list','/services/cv-writing':'cv'}[path];
 const canonical='https://taskforge-ai.pages.dev'+path;
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>'+detail.title+' | TaskForge AI</title><meta name="description" content="'+detail.description+'"><link rel="canonical" href="'+canonical+'">'+
 '</head><body style="font-family:system-ui;background:#0b1020;color:#f7f8fc;margin:0"><main style="max-width:780px;margin:8vh auto;padding:28px">'+
 '<p style="color:#9fe6b8">TASKFORGE AI · DIGITAL SERVICES</p><h1>'+detail.title+'</h1><p style="line-height:1.7;font-size:1.15rem">'+detail.description+'</p>'+
 '<p style="line-height:1.7;color:#b9c0d4">'+detail.note+'</p><p>Scope, price and timing are confirmed before any payment.</p>'+
 '<a style="color:#9fe6b8" href="/?service='+serviceSlug+'#order">Submit a project brief</a> · <a style="color:#9fe6b8" href="/">All services</a></main></body></html>';
}
const BASE='https://epkhqmhhzwlbxxypywau.supabase.co/functions/v1/';
function json(value,status=200){return new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}})}
async function handle(request){
 const url=new URL(request.url);
 const publicHeaders={'x-content-type-options':'nosniff','cache-control':'public, max-age=3600'};
 if(url.pathname==='/robots.txt'||url.pathname==='/sitemap.xml'){
  if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405});
  const robots=url.pathname==='/robots.txt';
  const text=robots?'User-agent: *\nAllow: /\nSitemap: https://taskforge-ai.pages.dev/sitemap.xml\n':
   '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+
   ['/',...Object.keys(SERVICE_DETAILS)].map(path=>'<url><loc>https://taskforge-ai.pages.dev'+path+'</loc></url>').join('')+'</urlset>';
  return new Response(request.method==='HEAD'?null:text,{headers:{...publicHeaders,'content-type':robots?'text/plain; charset=utf-8':'application/xml; charset=utf-8'}});
 }
 const detail=SERVICE_DETAILS[url.pathname];
 if(detail){
  if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405});
  return new Response(request.method==='HEAD'?null:serviceHtml(url.pathname,detail),{headers:{...publicHeaders,'content-type':'text/html; charset=utf-8','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"}});
 }
 if(['/api/login','/api/signup','/api/result','/api/checkout','/api/status'].includes(url.pathname)){
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const origin=request.headers.get('origin');if(origin&&origin!==url.origin)return json({error:'Origin not allowed'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required'},415);
  if(Number(request.headers.get('content-length'))>8192)return json({error:'Request too large'},413);
  try{
   const text=await request.text();if(text.length>8192)return json({error:'Request too large'},413);
   let body;try{body=JSON.parse(text)}catch{return json({error:'Invalid JSON'},400)}
   if(!body||typeof body!=='object')return json({error:'Invalid request'},400);
   if(url.pathname==='/api/result'||url.pathname==='/api/checkout'||url.pathname==='/api/status'){
    const token=request.headers.get('authorization');if(!token?.startsWith('Bearer '))return json({error:'Sign in to download.'},401);
    const r=await fetch(BASE+(url.pathname==='/api/checkout'?'create-whop-checkout':url.pathname==='/api/status'?'order-status':'download-order-result'),{method:'POST',headers:{authorization:token,'content-type':'application/json'},body:JSON.stringify({reference:body.reference}),signal:AbortSignal.timeout(15000)});
    return json(await r.json(),r.status);
   }
   if(typeof body.email!=='string'||body.email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)||typeof body.password!=='string'||body.password.length<8||body.password.length>128)return json({error:'Enter a valid email and password (8–128 characters).'},400);
   const signup=url.pathname==='/api/signup';
   const r=await fetch('https://epkhqmhhzwlbxxypywau.supabase.co/auth/v1/'+(signup?'signup':'token?grant_type=password'),{method:'POST',headers:{apikey:'sb_publishable_aH8nn2WXrFXIJ3yr1o35Ug_hNyTnpqV','content-type':'application/json'},body:JSON.stringify({email:body.email.trim().toLowerCase(),password:body.password}),signal:AbortSignal.timeout(15000)});
   const data=await r.json();
   if(!r.ok)return json({error:r.status===429?'Too many attempts. Please try again later.':signup?'Account creation unavailable. If you already have an account, sign in.':'Sign-in failed. Check your email, password and email confirmation.'},r.status===429?429:400);
   if(signup)return json({ok:true});
   if(typeof data.access_token!=='string')return json({error:'Sign-in unavailable.'},502);
   return json({access_token:data.access_token});
  }catch{return json({error:'Account service unavailable. Please try again later.'},502)}
 }

 if(url.pathname==='/api/order'){
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const origin=request.headers.get('origin');if(origin&&origin!==url.origin)return json({error:'Origin not allowed'},403);
  if(!request.headers.get('content-type')?.startsWith('multipart/form-data'))return json({error:'Use the project form to submit.'},415);
  if(Number(request.headers.get('content-length'))>16*1024*1024)return json({error:'File is too large. Maximum size is 15 MB.'},413);
  try{
   const data=await request.formData();
   if(!['pdf-to-excel','spreadsheet-cleanup','company-list','cv'].includes(String(data.get('service_slug'))))return json({error:'Choose a valid service.'},400);
   const name=String(data.get('customer_name')||'').trim(),email=String(data.get('customer_email')||'').trim(),brief=String(data.get('brief')||'').trim();
   if(!name||name.length>160||!brief||brief.length>10000||email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Enter a valid name, email and project brief.'},400);
   const file=data.get('file');if(file instanceof File&&file.size>15*1024*1024)return json({error:'File is too large. Maximum size is 15 MB.'},413);
   const upstream=await fetch(BASE+'create-order',{method:'POST',body:data});
   const result=await upstream.json();
   if(!upstream.ok)return json({error:result.error||'Could not submit your project.'},upstream.status);
   return json({reference:result.order.reference,status:'pending_review'},201);
  }catch{return json({error:'Unable to confirm submission. Please keep your details and try again later.'},502)}
 }
 if(url.pathname==='/api/lead'&&request.method==='POST'){
  try{const r=await fetch(BASE+'capture-lead',{method:'POST',headers:{'content-type':'application/json'},body:await request.text()});return json(await r.json(),r.status)}catch{return json({error:'Unable to submit.'},502)}
 }
 if(url.pathname!=='/')return new Response('Not found',{status:404});
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 return new Response(request.method==='HEAD'?null:HTML,{headers:{'content-type':'text/html;charset=UTF-8','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin','content-security-policy':"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"}});
}
addEventListener('fetch',event=>event.respondWith(handle(event.request)));
