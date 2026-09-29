const ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kaWZ4amVkeGlscXhhaXBidnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNzA1NjAsImV4cCI6MjEwNTk0NjU2MH0.zYlVymo8rcgcDY9TYO3cC8bAimle2Gfxi4SDAXAERXY';
const H={apikey:ANON,Authorization:'Bearer '+ANON};
(async()=>{
  // count products & new ones
  let r=await fetch('https://mdifxjedxilqxaipbvzc.supabase.co/rest/v1/products?select=id,slug,image_url&slug=in.(joint-care,diabetes-tea,mimosa-pudica,nutrisil-plus-natural-c)',{headers:H});
  console.log('new products:', await r.text());
  r=await fetch('https://mdifxjedxilqxaipbvzc.supabase.co/rest/v1/products?select=id&image_url=like.*product-images*',{headers:H});
  const b=await r.json(); console.log('images linked count:', Array.isArray(b)?b.length:b);
  // try inserting into user_roles with wrong col to see live column list from error
  r=await fetch('https://mdifxjedxilqxaipbvzc.supabase.co/rest/v1/user_roles',{method:'POST',headers:{...H,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({bogus_col_xyz:'x'})});
  console.log('user_roles insert probe:', r.status, (await r.text()).slice(0,500));
})();
