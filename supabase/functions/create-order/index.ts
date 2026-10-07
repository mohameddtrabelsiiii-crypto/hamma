import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const cors={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":"POST, OPTIONS"
};
const MAX_FILE_SIZE=15*1024*1024;
const ALLOWED_TYPES=new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/rtf"
]);

function response(body:unknown,status:number){
  return new Response(JSON.stringify(body),{
    status,
    headers:{...cors,"Content-Type":"application/json","Cache-Control":"no-store"}
  });
}
function safeFilename(name:string){
  const cleaned=name.replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,180);
  return cleaned||"upload";
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  if(req.method!=="POST")return response({error:"Method not allowed"},405);
  try{
    const supabase=createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const form=await req.formData();
    const serviceSlug=String(form.get("service_slug")??"").trim();
    const customerName=String(form.get("customer_name")??"").trim();
    const customerEmail=String(form.get("customer_email")??"").trim().toLowerCase();
    const briefValue=String(form.get("brief")??"").trim();
    const file=form.get("file");

    if(!serviceSlug||!customerEmail)throw new Error("Service and customer email are required.");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))throw new Error("Please enter a valid email address.");
    if(customerName.length>160)throw new Error("Name is too long.");
    if(briefValue.length>10000)throw new Error("Brief is too long.");

    const {data:service,error:serviceError}=await supabase
      .from("services")
      .select("id,slug,name,price_tnd,active")
      .eq("slug",serviceSlug)
      .eq("active",true)
      .single();
    if(serviceError||!service)throw new Error("Service not found.");

    let filePath:string|null=null;
    if(file instanceof File&&file.size>0){
      if(file.size>MAX_FILE_SIZE)throw new Error("File is too large. Maximum size is 15 MB.");
      if(file.type&&!ALLOWED_TYPES.has(file.type))throw new Error("Unsupported file type. Please upload PDF, Excel, CSV, DOCX, TXT or RTF.");
      const filename=safeFilename(file.name);
      filePath=`${crypto.randomUUID()}/${filename}`;
      const {error:uploadError}=await supabase.storage
        .from("order-files")
        .upload(filePath,file,{contentType:file.type||"application/octet-stream",upsert:false});
      if(uploadError)throw new Error(`File upload failed: ${uploadError.message}`);
    }

    const {data:order,error:orderError}=await supabase
      .from("orders")
      .insert({
        service_id:service.id,
        customer_name:customerName||null,
        customer_email:customerEmail,
        brief:briefValue||null,
        file_path:filePath,
        amount_tnd:service.price_tnd,
        status:"awaiting_payment"
      })
      .select("id,reference,amount_tnd,status,created_at")
      .single();

    if(orderError){
      if(filePath)await supabase.storage.from("order-files").remove([filePath]);
      throw new Error(orderError.message);
    }

    return response({
      order,
      service:{slug:service.slug,name:service.name},
      message:"Project received. Pricing and payment remain locked until review and authenticated checkout."
    },201);
  }catch(error){
    return response({error:error instanceof Error?error.message:"Unexpected error."},400);
  }
});
