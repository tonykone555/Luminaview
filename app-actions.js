function bindApp(){
  document.querySelectorAll("[data-page]").forEach(el=>el.onclick=()=>{S.page=el.dataset.page;S.drawerMerchant=null;renderApp()});
  const visBuild=document.getElementById("visBuild");
  if(visBuild) visBuild.onclick=()=>{
    const name=document.getElementById("visBusiness")?.value||"Your business";
    const url=document.getElementById("visUrl")?.value||"website";
    const industry=document.getElementById("visIndustry")?.value||"Business";
    const city=document.getElementById("visCity")?.value||"your market";
    const box=document.getElementById("visPreview");
    box.style.display="block";
    box.innerHTML=`<b>${esc(name)} · ${esc(industry)} · ${esc(city)}</b><p>${esc(url)}</p><p>Buyer-intent template, competitor-evidence slots, report structure and outreach copy are ready. Live competitor names should populate only after evidence checks return results.</p>`;
    const outreach=document.getElementById("visOutreach");
    if(outreach) outreach.textContent=`Hi ${name} — I checked how your business could be represented when people ask AI tools high-intent questions around ${industry.toLowerCase()} services in ${city}. The preview is designed to show which questions you appear for, which competitors appear instead, and the first website/entity changes worth implementing. I can send the short report over if useful.`;
  };
  document.querySelector('[data-action="visibility-preview"]')?.addEventListener('click',()=>document.getElementById('visBusiness')?.focus());
  document.querySelector('[data-action="visibility-report"]')?.addEventListener('click',()=>document.getElementById('visOutreach')?.scrollIntoView({behavior:'smooth',block:'center'}));
  document.querySelectorAll("[data-merchant]").forEach(el=>el.onclick=()=>{S.drawerMerchant=el.dataset.merchant;S.drawerTab="snapshot";renderApp()});
  document.querySelectorAll("[data-drawer-tab]").forEach(el=>el.onclick=()=>{S.drawerTab=el.dataset.drawerTab;document.getElementById("merchantDrawer").innerHTML=drawerHtml();bindDrawerOnly();refreshIcons()});
  document.querySelectorAll("[data-action]").forEach(el=>el.onclick=()=>handleAction(el.dataset.action,el));
  document.querySelectorAll("[data-analyze]").forEach(el=>el.onclick=()=>analyzeMerchant(el.dataset.analyze));
  document.querySelectorAll("[data-generate]").forEach(el=>el.onclick=()=>generateOutreach(el.dataset.generate));
  document.querySelectorAll("[data-approve]").forEach(el=>el.onclick=()=>approveOutreach(el.dataset.approve));
  document.querySelectorAll("[data-send]").forEach(el=>el.onclick=()=>sendOutreach(el.dataset.send));
  document.querySelectorAll("[data-copy]").forEach(el=>el.onclick=async()=>{await navigator.clipboard.writeText(el.dataset.copy);toast("Booking link copied.","good")});
  document.querySelectorAll("[data-outreach-view]").forEach(el=>el.onclick=()=>showOutreach(el.dataset.outreachView));
  const gs=document.getElementById("globalSearch"); if(gs){gs.onkeydown=e=>{if(e.key==="Enter")globalSearch(gs.value)}}
  const aiForm=document.getElementById("aiForm"); if(aiForm)aiForm.onsubmit=askAI;
}
function bindDrawerOnly(){
  document.querySelectorAll("[data-drawer-tab]").forEach(el=>el.onclick=()=>{S.drawerTab=el.dataset.drawerTab;document.getElementById("merchantDrawer").innerHTML=drawerHtml();bindDrawerOnly();refreshIcons()});
  document.querySelectorAll("[data-action]").forEach(el=>el.onclick=()=>handleAction(el.dataset.action,el));
  document.querySelectorAll("[data-analyze]").forEach(el=>el.onclick=()=>analyzeMerchant(el.dataset.analyze));
  document.querySelectorAll("[data-generate]").forEach(el=>el.onclick=()=>generateOutreach(el.dataset.generate));
}
async function handleAction(action,el){
  if(action==="signout") return sb.auth.signOut();
  if(action==="refresh"){toast("Refreshing…");await loadAll();renderApp();toast("View is up to date.","good");return}
  if(action==="close-drawer"){S.drawerMerchant=null;renderApp();return}
  if(action==="open-ai"){document.getElementById("aiWrap").classList.add("open");refreshIcons();return}
  if(action==="close-ai"){document.getElementById("aiWrap").classList.remove("open");return}
  if(action==="add-merchant")return openAddMerchant();
  if(action==="import-csv")return openImport();
  if(action==="queue-discovery")return queueDiscovery();
  if(action==="analyze-unscored")return analyzeUnscored();
  if(action==="save-settings")return saveSettings();
  if(action==="add-contact")return openAddContact(el.dataset.merchantId);
}
function modal(html){const w=document.getElementById("modalWrap"),m=document.getElementById("modal");m.innerHTML=html;w.classList.add("open");refreshIcons();m.querySelectorAll("[data-modal-close]").forEach(x=>x.onclick=closeModal)}
function closeModal(){document.getElementById("modalWrap")?.classList.remove("open")}
function openAddMerchant(){
  modal(`<div class="modal-head"><div><div class="eyebrow">Discover</div><h3>Add merchant</h3></div><button class="modal-close" data-modal-close>×</button></div><form id="merchantForm"><div class="form-grid">
    <div class="field"><label>Brand name</label><input name="name" required></div><div class="field"><label>Domain</label><input name="domain" placeholder="brand.com"></div>
    <div class="field"><label>Category</label><input name="category" placeholder="Fashion"></div><div class="field"><label>Platform</label><select name="platform"><option value="">Unknown</option><option>Shopify</option><option>WooCommerce</option><option>TikTok Shop</option><option>BigCommerce</option><option>Direct</option></select></div>
    <div class="field"><label>Country</label><input name="country" placeholder="UK"></div><div class="field"><label>Instagram</label><input name="instagram_url" placeholder="https://instagram.com/…"></div>
    <div class="field fullfield"><label>TikTok</label><input name="tiktok_url" placeholder="https://tiktok.com/@…"></div>
  </div><div class="modal-actions"><button type="button" class="secondary" data-modal-close>Cancel</button><button class="primary">Add merchant</button></div></form>`);
  document.getElementById("merchantForm").onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target),p=Object.fromEntries(fd.entries());try{const r=await edge("create_merchant",p);closeModal();await reload("merchants");await reload("events");renderApp();toast(r.duplicate?"Merchant already existed.":"Merchant added.","good")}catch(err){toast(err.message,"bad")}};
}
function openImport(){
  modal(`<div class="modal-head"><div><div class="eyebrow">Discover</div><h3>Import merchants</h3></div><button class="modal-close" data-modal-close>×</button></div><p style="font-size:12px;color:#858892;line-height:1.6">Upload a CSV. View recognizes common columns like name/business name, domain/website, category, country and platform. Existing domains are skipped.</p><div class="field"><label>CSV file</label><input id="csvFile" type="file" accept=".csv,text/csv"></div><div class="modal-actions"><button class="secondary" data-modal-close>Cancel</button><button class="primary" id="runImport">Import</button></div>`);
  document.getElementById("runImport").onclick=importCsv;
}
function normDomain(v){try{return String(v||"").trim().replace(/^https?:\/\//i,"").replace(/^www\./i,"").split("/")[0].toLowerCase()}catch{return""}}
async function importCsv(){
  const file=document.getElementById("csvFile").files[0]; if(!file)return toast("Choose a CSV first.","bad");
  const parsed=Papa.parse(await file.text(),{header:true,skipEmptyLines:true,transformHeader:h=>h.trim().toLowerCase()});
  const existing=new Set(S.merchants.map(m=>(m.domain||"").toLowerCase()));
  const get=(r,keys)=>{for(const k of keys)if(r[k])return r[k];return""};
  const rows=parsed.data.map(r=>{const website=get(r,["domain","website","website url","url","store","store url"]),domain=normDomain(website);return{name:get(r,["name","brand","business name","company","store name"])||domain,domain:domain||null,website_url:domain?`https://${domain}`:null,category:get(r,["category","niche","vertical"])||null,country:get(r,["country","location"])||null,platform:get(r,["platform","ecommerce platform"])||null,instagram_url:get(r,["instagram","instagram url","ig","instagram handle"])||null,tiktok_url:get(r,["tiktok","tiktok url"])||null,lifecycle_stage:"discovered"}}).filter(x=>x.name&&!existing.has((x.domain||"").toLowerCase()));
  if(!rows.length)return toast("No new merchants found.","bad");
  const {error}=await sb.from("view_merchants").upsert(rows,{onConflict:"domain",ignoreDuplicates:true});
  if(error)return toast(error.message,"bad");
  closeModal();await reload("merchants");renderApp();toast(`${rows.length} merchants imported.`,"good");
}
async function queueDiscovery(){
  const {error}=await sb.from("view_jobs").insert({job_type:"DISCOVER_MERCHANTS",target_type:"workspace",status:"queued",priority:50,payload:{daily_target:Number(S.settings.discovery_daily_target||2000),requested_from:"view_app"}});
  if(error)return toast(error.message,"bad");await reload("jobs");renderApp();toast("Discovery job queued. Connector workers will process it when enabled.","good");
}
