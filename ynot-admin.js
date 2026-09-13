const YNOTAdmin={items:[],loaded:false,loading:false,section:'All',source:'All',minScore:0};
if(!NAV.some(n=>n[0]==='ynot')) NAV.splice(7,0,['ynot','badge-percent','YNOT']);
const _ynotBasePageHtml=pageHtml;
pageHtml=function(){return S.page==='ynot'?ynotAdminPage():_ynotBasePageHtml()};
const _ynotBaseBindApp=bindApp;
bindApp=function(){_ynotBaseBindApp();bindYnotAdmin()};

function ynotMoney(v,c='EUR'){try{return new Intl.NumberFormat(undefined,{style:'currency',currency:c||'EUR',maximumFractionDigits:2}).format(Number(v||0))}catch{return `${v||0} ${c||''}`}}
function ynotSections(){return ['All',...new Set(YNOTAdmin.items.flatMap(x=>x.sections||[]))]}
function ynotSources(){return ['All',...new Set(YNOTAdmin.items.map(x=>x.source).filter(Boolean))]}
function ynotVisible(){return YNOTAdmin.items.filter(x=>(YNOTAdmin.section==='All'||(x.sections||[]).includes(YNOTAdmin.section)||x.primary_section===YNOTAdmin.section)&&(YNOTAdmin.source==='All'||x.source===YNOTAdmin.source)&&Number(x.offer_score||0)>=YNOTAdmin.minScore)}
function ynotAdminPage(){
 const rows=ynotVisible();
 const pay4=YNOTAdmin.items.filter(x=>x.installment_eligible).length, under=YNOTAdmin.items.filter(x=>Number(x.price||999999)<=25).length, top=YNOTAdmin.items.filter(x=>Number(x.offer_score||0)>=80).length;
 const table=rows.map(x=>`<tr><td><div class="ynot-admin-product"><img src="${esc(x.image_url||'')}" alt=""><div><b>${esc(x.title)}</b><span>${esc(x.brand||'')} · ${esc(x.primary_section||'')}</span></div></div></td><td>${ynotMoney(x.price,x.currency)}</td><td><span class="pill">${esc(x.primary_section||'—')}</span></td><td>${(x.sections||[]).slice(0,3).map(s=>`<span class="pill gray">${esc(s)}</span>`).join(' ')}</td><td><b>${x.offer_score||0}</b></td><td>${x.installment_eligible?'Yes':'—'}</td><td>${esc(x.source||'—')}</td><td><a class="row-action" href="${esc(x.product_url||'#')}" target="_blank" rel="noreferrer">Open</a></td></tr>`).join('');
 return pageIntro('catalog','YNOT product universe.','See exactly what Lumina is surfacing inside YNOT, how each product was classified, and which offers are strongest.',`<button class="secondary" id="ynotReload">${icon('refresh-cw')} Reload</button><button class="primary" id="ynotSync">${icon('sparkles')} Refresh live feed</button>`)+`
 <section class="grid ynot-admin-grid">
   ${metric('Live products',YNOTAdmin.items.length,'Current YNOT feed')}
   ${metric('Offer score 80+',top,'Strongest opportunities')}
   ${metric('Under 25',under,'Impulse-price products')}
   ${metric('4x candidates',pay4,'Installment-friendly price range')}
   <article class="card full"><div class="card-head"><div><h3>Feed controls</h3><small>Products are auto-classified by price, vertical and offer score</small></div><span class="pill green">${YNOTAdmin.loaded?'Live':'Loading'}</span></div>
   <div class="ynot-admin-filters"><div class="field"><label>Section</label><select id="ynotSection">${ynotSections().map(s=>`<option ${YNOTAdmin.section===s?'selected':''}>${esc(s)}</option>`).join('')}</select></div><div class="field"><label>Source</label><select id="ynotSource">${ynotSources().map(s=>`<option ${YNOTAdmin.source===s?'selected':''}>${esc(s)}</option>`).join('')}</select></div><div class="field"><label>Min offer score</label><input id="ynotScore" type="number" min="0" max="100" value="${YNOTAdmin.minScore}"></div></div></article>
   <article class="card full"><div class="card-head"><div><h3>YNOT products</h3><small>${rows.length} visible products</small></div></div>${table?`<div class="table-wrap"><table class="table ynot-admin-table"><thead><tr><th>Product</th><th>Price</th><th>Primary</th><th>Also appears in</th><th>Score</th><th>4x</th><th>Source</th><th></th></tr></thead><tbody>${table}</tbody></table></div>`:empty('badge-percent','No YNOT products yet',YNOTAdmin.loading?'Refreshing the feed…':'Refresh the live feed to pull products into YNOT.')}</article>
 </section>`;
}
async function loadYnotAdmin(repaint=true){if(YNOTAdmin.loading)return;YNOTAdmin.loading=true;try{const {data,error}=await sb.from('view_ynot_products').select('*').eq('active',true).order('offer_score',{ascending:false}).limit(200);if(error)throw error;YNOTAdmin.items=data||[];YNOTAdmin.loaded=true}catch(e){toast(e.message||'Could not load YNOT','bad')}finally{YNOTAdmin.loading=false;if(repaint)renderApp()}}
async function syncYnotAdmin(){if(YNOTAdmin.loading)return;YNOTAdmin.loading=true;renderApp();try{const {data,error}=await sb.functions.invoke('ynot-feed',{body:{refresh:true,country:'FR'}});if(error)throw error;if(data?.error)throw new Error(data.error);toast(`${data?.items?.length||0} live YNOT products refreshed.`,'good');YNOTAdmin.loading=false;await loadYnotAdmin(false);renderApp()}catch(e){YNOTAdmin.loading=false;toast(e.message||'YNOT refresh failed','bad');renderApp()}}
function bindYnotAdmin(){if(S.page!=='ynot')return;if(!YNOTAdmin.loaded&&!YNOTAdmin.loading)setTimeout(()=>loadYnotAdmin(),0);document.getElementById('ynotReload')?.addEventListener('click',()=>loadYnotAdmin());document.getElementById('ynotSync')?.addEventListener('click',syncYnotAdmin);document.getElementById('ynotSection')?.addEventListener('change',e=>{YNOTAdmin.section=e.target.value;renderApp()});document.getElementById('ynotSource')?.addEventListener('change',e=>{YNOTAdmin.source=e.target.value;renderApp()});document.getElementById('ynotScore')?.addEventListener('change',e=>{YNOTAdmin.minScore=Number(e.target.value||0);renderApp()})}
