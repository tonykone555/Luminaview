async function analyzeMerchant(id){
  toast("Analyzing merchant…");try{await edge("analyze_merchant",{merchant_id:id});await Promise.all([reload("scores"),reload("merchants"),reload("events")]);renderApp();toast("Intelligence updated.","good")}catch(err){toast(err.message,"bad")}
}
async function analyzeUnscored(){
  const missing=S.merchants.filter(m=>!scoreMap()[m.id]).slice(0,25); if(!missing.length)return toast("Everything currently loaded is analyzed.","good");
  toast(`Analyzing ${missing.length} merchants…`);
  for(const m of missing){try{await edge("analyze_merchant",{merchant_id:m.id})}catch(e){console.warn(e)}}
  await Promise.all([reload("scores"),reload("merchants"),reload("events")]);renderApp();toast("Batch analysis finished.","good");
}
async function generateOutreach(id){
  try{const r=await edge("generate_outreach",{merchant_id:id});await Promise.all([reload("outreach"),reload("merchants"),reload("events")]);S.page="reach";S.drawerMerchant=null;renderApp();toast("Personalized outreach draft created.","good")}catch(err){toast(err.message,"bad")}
}
async function approveOutreach(id){
  try{await edge("approve_outreach",{outreach_id:id});await reload("outreach");renderApp();toast("Outreach approved.","good")}catch(err){toast(err.message,"bad")}
}
async function sendOutreach(id){
  try{await edge("send_outreach",{outreach_id:id});await Promise.all([reload("outreach"),reload("merchants"),reload("events")]);renderApp();toast("Email sent.","good")}catch(err){const msg=err.message==="email_provider_not_connected"?"Email delivery is not connected yet. Open Settings → Outreach delivery.":err.message;toast(msg,"bad")}
}
function showOutreach(id){
  const o=S.outreach.find(x=>x.id===id),m=S.merchants.find(x=>x.id===o?.merchant_id);if(!o)return;
  modal(`<div class="modal-head"><div><div class="eyebrow">${esc(o.status)}</div><h3>${esc(m?.name||"Outreach")}</h3></div><button class="modal-close" data-modal-close>×</button></div><div class="finding"><b>Subject</b><p>${esc(o.subject||"")}</p></div><div class="finding"><b>Personalized observation</b><p>${esc(o.personalized_observation||"")}</p></div><div class="finding"><b>Message</b><p style="white-space:pre-wrap">${esc(o.body||"")}</p></div><div class="finding"><b>Booking URL</b><p>${esc(o.booking_url||"—")}</p></div><div class="modal-actions">${o.status==="draft"?`<button class="primary" id="modalApprove">Approve</button>`:""}<button class="secondary" data-modal-close>Close</button></div>`);
  const b=document.getElementById("modalApprove");if(b)b.onclick=async()=>{closeModal();await approveOutreach(id)};
}
function openAddContact(merchantId){
  modal(`<div class="modal-head"><div><div class="eyebrow">Merchant 360</div><h3>Add contact route</h3></div><button class="modal-close" data-modal-close>×</button></div><form id="contactForm"><div class="form-grid"><div class="field"><label>Name</label><input name="full_name"></div><div class="field"><label>Role</label><input name="role" placeholder="Founder"></div><div class="field"><label>Channel</label><select name="channel"><option value="email">Email</option><option value="instagram">Instagram</option><option value="linkedin">LinkedIn</option><option value="contact_form">Contact form</option><option value="affiliate_application">Affiliate application</option></select></div><div class="field"><label>Value / address</label><input name="value" required></div></div><div class="modal-actions"><button type="button" class="secondary" data-modal-close>Cancel</button><button class="primary">Save contact</button></div></form>`);
  document.getElementById("contactForm").onsubmit=async e=>{e.preventDefault();const p=Object.fromEntries(new FormData(e.target).entries());const {error}=await sb.from("view_contacts").insert({...p,merchant_id:merchantId,is_primary:true});if(error)return toast(error.message,"bad");closeModal();await reload("contacts");renderApp();toast("Contact route added.","good")};
}
async function saveSettings(){
  const value={...S.settings,demo_url:document.getElementById("setDemo")?.value.trim()||null,booking_base_url:document.getElementById("setBooking")?.value.trim()||"https://luminalive.netlify.app/",discovery_daily_target:Number(document.getElementById("setDiscovery")?.value||2000),outreach_daily_target:Number(document.getElementById("setOutreach")?.value||500),email_provider:document.getElementById("setProvider")?.value||"disconnected"};
  const {error}=await sb.from("view_settings").upsert({key:"workspace",value,updated_at:new Date().toISOString()});if(error)return toast(error.message,"bad");S.settings=value;renderApp();toast("Settings saved.","good")
}
async function askAI(e){
  e.preventDefault();const inp=document.getElementById("aiInput"),q=inp.value.trim();if(!q)return;const thread=document.getElementById("aiThread");thread.innerHTML+=`<div class="msg user">${esc(q)}</div>`;inp.value="";thread.scrollTop=thread.scrollHeight;
  try{const r=await edge("view_ai",{query:q});thread.innerHTML+=`<div class="msg bot">${esc(r.answer)}${r.items?.length?`<div style="margin-top:9px">${r.items.slice(0,8).map(m=>`<button class="secondary" style="margin:3px 4px 0 0;padding:7px 9px" data-ai-merchant="${m.id}">${esc(m.name)}</button>`).join("")}</div>`:""}</div>`;thread.querySelectorAll("[data-ai-merchant]").forEach(b=>b.onclick=()=>{document.getElementById("aiWrap").classList.remove("open");S.drawerMerchant=b.dataset.aiMerchant;S.drawerTab="snapshot";renderApp()});refreshIcons();thread.scrollTop=thread.scrollHeight}catch(err){thread.innerHTML+=`<div class="msg bot">I couldn't run that command: ${esc(err.message)}</div>`}
}
function globalSearch(q){
  q=q.trim().toLowerCase();if(!q)return;const m=S.merchants.find(x=>[x.name,x.domain,x.category,x.platform].some(v=>String(v||"").toLowerCase().includes(q)));if(m){S.drawerMerchant=m.id;S.drawerTab="snapshot";renderApp();return}S.page="discover";renderApp();toast("No exact merchant match. Opened Discover.");
}

init();
