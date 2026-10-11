import {test} from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../worker.js",import.meta.url),"utf8");
let listener;
vm.runInNewContext(source,{Request,Response,URL,File,AbortSignal,fetch:()=>{throw Error("Unexpected network call")},addEventListener:(_,handler)=>listener=handler});
async function request(path){let response;listener({request:new Request("https://taskforge.example"+path),respondWith:pending=>response=pending});return response}
test("Premium homepage preserves real B2B conversion paths and client forms",async()=>{
 const page=await request("/");assert.equal(page.status,200);const html=await page.text();
 for(const marker of ['id="tf-main-content"','id="tf-services"','id="tf-how"','id="order-section"','id="order"','id="result-form"','href="/automation#b2b-lead"','href="/automation/leadops"','href="/automation/crm-cleanup"','href="/automation/inventory-reservations"','href="/services/rfq-catalogue-check"','href="/services/excel-consolidation"','href="/examples"'])assert.ok(html.includes(marker),"Missing "+marker);
 assert.equal((html.match(/class="tf-service"/g)||[]).length,6);
 assert.match(html,/not customer deployments/);
 assert.match(html,/No payment at inquiry/);
 assert.doesNotMatch(html,/\b(?:10,000 clients|guaranteed ROI|verified testimonials)\b/i);
});
test("Demo and assessment routes remain accessible without paid or fabricated integration",async()=>{
 for(const path of ["/automation","/automation/demo","/automation/leadops","/automation/crm-cleanup","/automation/inventory-reservations","/examples","/services/excel-consolidation"]){
  const r=await request(path);assert.equal(r.status,200,path);
 }
});
