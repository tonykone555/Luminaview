
const SUPABASE_URL = "https://iycxkwoxbkanfyraohge.supabase.co";
const SUPABASE_KEY = "sb_publishable_iEr51znHBs9AMQ1j6lg8og_H4lPH82M";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } });

const S = {
  session:null, member:null, page:"overview", drawerMerchant:null, drawerTab:"snapshot",
  experience:[], sources:[], settings:{}, merchants:[], scores:[], contacts:[], programs:[],
  outreach:[], campaigns:[], jobs:[], products:[], offers:[], revenue:[], events:[], bookings:[],
  authMode:"signin", loading:true
};

const NAV = [
 ["overview","home","Overview"],["discover","compass","Discover"],["intelligence","brain-circuit","Intelligence"],["visibility","radar","AI Visibility"],
 ["reach","send","Reach"],["partnerships","handshake","Partnerships"],["catalog","layout-grid","Catalog"],
 ["revenue","chart-no-axes-combined","Revenue"],["automations","workflow","Automations"],["sources","plug-zap","Sources"],
 ["portal","badge-check","Merchant Portal"]
];
const TOP = [["overview","Overview"],["discover","Discover"],["reach","Reach"],["partnerships","Partners"],["revenue","Revenue"]];

function esc(v=""){ return String(v ?? "").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }
function fmtDate(v){ if(!v) return "—"; try{return new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(v))}catch{return "—"} }
function euro(v){ return new Intl.NumberFormat(undefined,{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(Number(v||0)); }
function toast(msg,type=""){ const h=document.getElementById("toastHost"); if(!h)return; const el=document.createElement("div");el.className=`toast ${type}`;el.textContent=msg;h.appendChild(el);setTimeout(()=>el.remove(),3300); }
function icon(name,cls=""){ return `<i data-lucide="${name}" class="${cls}"></i>`; }
function refreshIcons(){ if(window.lucide) lucide.createIcons({attrs:{"stroke-width":1.65}}); }
function initials(){ const e=S.session?.user?.email||"LV"; return e.split("@")[0].slice(0,2).toUpperCase(); }
function root(html){ document.getElementById("root").innerHTML=html; refreshIcons(); }

async function init(){
  const {data:{session}} = await sb.auth.getSession();
  S.session=session;
  sb.auth.onAuthStateChange(async (_event,session)=>{S.session=session;if(session) await bootstrap(); else {S.member=null;render();}});
  if(session) await bootstrap(); else {S.loading=false;render();}
}
async function bootstrap(){
  S.loading=true; render();
  const {data:member,error} = await sb.from("view_members").select("*").eq("user_id",S.session.user.id).maybeSingle();
  S.member=member||null;
  if(!member){S.loading=false;render();return;}
  await loadAll(); S.loading=false; render();
}
async function all(table, opts={}) {
  let q=sb.from(table).select(opts.select||"*");
  if(opts.order) q=q.order(opts.order,{ascending:opts.asc??false});
  if(opts.limit) q=q.limit(opts.limit);
  const {data,error}=await q;
  if(error){ console.warn(table,error); return []; }
  return data||[];
}
async function loadAll(){
  const out = await Promise.all([
    all("view_experience_registry",{order:"sort_order",asc:true}),
    all("view_sources",{order:"name",asc:true}),
    sb.from("view_settings").select("*").eq("key","workspace").maybeSingle(),
    all("view_merchants",{order:"updated_at"}),
    all("view_scores"),
    all("view_contacts",{order:"created_at"}),
    all("view_program_relationships",{order:"updated_at"}),
    all("view_outreach",{order:"created_at"}),
    all("view_campaigns",{order:"created_at"}),
    all("view_jobs",{order:"created_at",limit:100}),
    all("view_products",{order:"updated_at",limit:150}),
    all("view_offers",{order:"updated_at",limit:150}),
    all("view_revenue_events",{order:"occurred_at",limit:200}),
    all("view_events",{order:"created_at",limit:150}),
    all("demo_booking_requests",{order:"created_at",limit:100})
  ]);
  [S.experience,S.sources,settingResult,S.merchants,S.scores,S.contacts,S.programs,S.outreach,S.campaigns,S.jobs,S.products,S.offers,S.revenue,S.events,S.bookings] = out;
  S.settings=settingResult?.data?.value||{};
}
async function reload(part="all"){
  if(part==="all") return loadAll();
  const map={
    merchants:["view_merchants","merchants"],scores:["view_scores","scores"],contacts:["view_contacts","contacts"],
    outreach:["view_outreach","outreach"],jobs:["view_jobs","jobs"],settings:["view_settings","settings"],
    programs:["view_program_relationships","programs"],revenue:["view_revenue_events","revenue"],events:["view_events","events"],
    bookings:["demo_booking_requests","bookings"],products:["view_products","products"],offers:["view_offers","offers"]
  };
  const cfg=map[part]; if(!cfg)return;
  if(part==="settings"){const {data}=await sb.from("view_settings").select("*").eq("key","workspace").maybeSingle();S.settings=data?.value||{};return;}
  S[cfg[1]]=await all(cfg[0],{order:part==="revenue"?"occurred_at":part==="bookings"?"created_at":"updated_at"});
}
async function edge(action,payload={}){
  const {data,error}=await sb.functions.invoke("view-ops",{body:{action,...payload}});
  if(error) throw new Error(error.message||"Request failed");
  if(data?.error) throw Object.assign(new Error(data.error),{data});
  return data;
}

function render(){
  if(S.loading){root(`<div class="loading"><div><div class="spinner"></div><div style="margin-top:12px;font-size:12px">Opening Lumina View…</div></div></div>`);return}
  if(!S.session){renderAuth();return}
  if(!S.member){renderNoAccess();return}
  renderApp();
}
function renderAuth(){
  root(`<section class="auth">
    <div class="auth-shell">
      <div class="auth-art">
        <div class="auth-logo"><span class="auth-orb">L</span> Lumina View</div>
        <h1>Commerce intelligence that actually moves.</h1>
        <p>Discover merchants, understand their opportunity, reach them with personalized value, build partnerships and track every revenue path.</p>
        <div class="auth-proof"><span>Merchant graph</span><span>View AI</span><span>Reach OS</span><span>Revenue attribution</span></div>
      </div>
      <form class="auth-form" id="authForm">
        <div class="eyebrow">Private operator workspace</div>
        <h2>${S.authMode==="signup"?"Create owner access":"Welcome back"}</h2>
        <p>${S.authMode==="signup"?"The first account becomes the Lumina View owner.":"Sign in to your internal merchant intelligence workspace."}</p>
        <div class="field"><label>Email</label><input id="authEmail" type="email" required autocomplete="email"></div>
        <div class="field"><label>Password</label><input id="authPassword" type="password" minlength="8" required autocomplete="${S.authMode==="signup"?"new-password":"current-password"}"></div>
        <button class="primary" type="submit">${S.authMode==="signup"?"Create owner account":"Sign in"}</button>
        <div class="auth-switch">${S.authMode==="signup"?"Already have access?":"First time here?"} <button type="button" id="authSwitch">${S.authMode==="signup"?"Sign in":"Create owner account"}</button></div>
      </form>
    </div>
  </section>`);
  document.getElementById("authSwitch").onclick=()=>{S.authMode=S.authMode==="signup"?"signin":"signup";renderAuth()};
  document.getElementById("authForm").onsubmit=authSubmit;
}
async function authSubmit(e){
  e.preventDefault(); const email=document.getElementById("authEmail").value.trim(), password=document.getElementById("authPassword").value;
  try{
    if(S.authMode==="signup"){
      const {data,error}=await sb.auth.signUp({email,password}); if(error)throw error;
      if(!data.session) toast("Account created. Check your email to confirm, then sign in.","good");
      else toast("Owner account created.","good");
    }else{
      const {error}=await sb.auth.signInWithPassword({email,password}); if(error)throw error;
    }
  }catch(err){toast(err.message||"Authentication failed","bad")}
}
function renderNoAccess(){
  root(`<section class="auth"><div class="auth-shell" style="grid-template-columns:1fr;max-width:560px"><div class="auth-form">
    <div class="eyebrow">Lumina View</div><h2>Access not enabled</h2><p>This account exists but is not an internal View member. Sign out or ask the workspace owner to grant access.</p>
    <button class="secondary" id="signOutNoAccess">Sign out</button>
  </div></div></section>`);
  document.getElementById("signOutNoAccess").onclick=()=>sb.auth.signOut();
}
function renderApp(){
  const nav=NAV.map((n,i)=>`${i===6?'<div class="side-sep"></div>':''}<button class="side-item ${S.page===n[0]?'active':''}" data-page="${n[0]}" data-label="${n[2]}">${icon(n[1])}</button>`).join("");
  const top=TOP.map(n=>`<button class="${S.page===n[0]?'active':''}" data-page="${n[0]}">${n[1]}</button>`).join("");
  root(`<div class="app">
    <aside class="sidebar">
      <button class="side-logo" data-page="overview"><span class="logo-orb">L</span></button>
      <div class="side-nav">${nav}</div>
      <div class="side-bottom">
        <button class="side-item" data-action="open-ai" data-label="View AI">${icon("sparkles")}</button>
        <button class="side-item ${S.page==="settings"?'active':''}" data-page="settings" data-label="Settings">${icon("settings-2")}</button>
        <div class="avatar" data-action="signout" title="${esc(S.session.user.email)}">${initials()}</div>
      </div>
    </aside>
    <section class="shell">
      <header class="topbar">
        <div class="brand"><strong>Lumina</strong><span>View</span></div>
        <label class="global-search">${icon("search")}<input id="globalSearch" placeholder="Search merchants, campaigns, networks…"><kbd>⌘K</kbd></label>
        <nav class="top-segments">${top}</nav>
        <button class="top-icon" data-action="refresh" title="Refresh">${icon("refresh-cw")}</button>
        <button class="primary" data-action="add-merchant">+ Add merchant</button>
      </header>
      <main class="main">${pageHtml()}</main>
    </section>
    <div class="drawer-bg ${S.drawerMerchant?'open':''}" data-action="close-drawer"></div>
    <aside class="drawer ${S.drawerMerchant?'open':''}" id="merchantDrawer">${drawerHtml()}</aside>
    ${modalShell()}
    ${aiShell()}
  </div>`);
  bindApp();
  refreshIcons();
}
function experienceFor(key){return S.experience.find(x=>x.key===key)}
function pageIntro(key,title,desc,actions=""){
  const exp=experienceFor(key);
  const feats=(exp?.features||[]).map((f,i)=>`<button class="feature-bubble" data-feature="${esc(f)}"><span class="feature-icon">${icon(featureIcon(f,i))}</span><span>${esc(f)}</span></button>`).join("");
  return `<section class="hero"><div><div class="eyebrow">${esc(exp?.label||key)}</div><h1>${title}</h1><p>${desc}</p></div><div class="hero-actions">${actions}</div></section><div class="experience-strip">${feats}</div>`;
}
function featureIcon(f,i){
  const s=String(f).toLowerCase();
  if(s.includes("email")||s.includes("outreach")||s.includes("send"))return"mail";
  if(s.includes("revenue")||s.includes("commission")||s.includes("monet"))return"badge-dollar-sign";
  if(s.includes("merchant")||s.includes("brand"))return"store";
  if(s.includes("contact"))return"contact";
  if(s.includes("score")||s.includes("fit")||s.includes("evidence"))return"scan-search";
  if(s.includes("ugc")||s.includes("video"))return"clapperboard";
  if(s.includes("affiliate")||s.includes("program")||s.includes("partner"))return"handshake";
  if(s.includes("job")||s.includes("automation")||s.includes("sync")||s.includes("retry"))return"workflow";
  if(s.includes("catalog")||s.includes("product")||s.includes("feed"))return"package-search";
  if(s.includes("booking")||s.includes("call"))return"calendar-check-2";
  if(s.includes("ai"))return"sparkles";
  return ["circle-dot","sparkles","layers-3","radar","scan-line","route","target","wand-sparkles"][i%8];
}
function pageHtml(){
  return ({
    overview:overviewPage,discover:discoverPage,intelligence:intelligencePage,visibility:visibilityPage,reach:reachPage,
    partnerships:partnershipsPage,catalog:catalogPage,revenue:revenuePage,automations:automationsPage,
    sources:sourcesPage,portal:portalPage,settings:settingsPage
  }[S.page]||overviewPage)();
}
function scoreMap(){return Object.fromEntries(S.scores.map(x=>[x.merchant_id,x]))}
function contactMap(){const m={};S.contacts.forEach(c=>(m[c.merchant_id]??=[]).push(c));return m}
function merchantCard(m){
  const s=scoreMap()[m.id], sc=s?.lumina_fit??m.priority??0, cm=contactMap()[m.id]||[];
  return `<article class="merchant-card" data-merchant="${m.id}">
    <div class="merchant-top"><div class="merchant-logo">${esc((m.name||"L")[0])}</div><div class="merchant-info"><b>${esc(m.name)}</b><span>${esc(m.domain||m.website_url||"No domain")} · ${esc(m.category||"Unclassified")}</span></div><div class="ring" style="--score:${sc}"><span>${sc||"—"}</span></div></div>
    <div class="merchant-meta"><span class="pill">${esc(m.platform||"Direct")}</span><span class="pill gray">${esc(m.lifecycle_stage||"discovered")}</span><span class="pill ${cm.some(c=>c.verified)?'green':''}">${cm.length} contact${cm.length===1?'':'s'}</span></div>
  </article>`;
}
function metric(label,value,sub,trend=""){
  return `<article class="card metric"><label>${label}</label><div class="value">${value}</div>${trend?`<span class="trend">${trend}</span>`:""}<div class="sub">${sub||""}</div></article>`;
}
function bars(vals){return `<div class="chart">${vals.map(v=>`<div class="bar" style="height:${v}%"></div>`).join("")}</div>`}
function empty(iconName,title,text,action=""){return `<div class="empty"><div><div class="empty-icon">${icon(iconName)}</div><h3>${title}</h3><p>${text}</p>${action}</div></div>`}
