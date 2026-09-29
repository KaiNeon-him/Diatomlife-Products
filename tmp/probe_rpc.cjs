const ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kaWZ4amVkeGlscXhhaXBidnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNzA1NjAsImV4cCI6MjEwNTk0NjU2MH0.zYlVymo8rcgcDY9TYO3cC8bAimle2Gfxi4SDAXAERXY';
(async()=>{
  const r = await fetch('https://mdifxjedxilqxaipbvzc.supabase.co/rest/v1/rpc/place_order',{method:'POST',headers:{apikey:ANON,Authorization:'Bearer '+ANON,'Content-Type':'application/json'},body:'{}'});
  console.log('place_order rpc:', r.status, (await r.text()).slice(0,300));
})();
