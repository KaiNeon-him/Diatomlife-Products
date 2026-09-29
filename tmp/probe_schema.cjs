const ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kaWZ4amVkeGlscXhhaXBidnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNzA1NjAsImV4cCI6MjEwNTk0NjU2MH0.zYlVymo8rcgcDY9TYO3cC8bAimle2Gfxi4SDAXAERXY';
const URL='https://mdifxjedxilqxaipbvzc.supabase.co/rest/v1/';
const H={apikey:ANON,Authorization:'Bearer '+ANON};
(async()=>{
  for (const t of ['user_roles','profiles','orders','order_items','products']) {
    const r = await fetch(URL+t+'?select=*&limit=1', {headers:H});
    let body = await r.text(); if(body.length>300) body=body.slice(0,300)+'...';
    console.log(t, r.status, body.replace(/\n/g,' '));
  }
})();
