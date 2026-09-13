function overviewPage(){
  const replies=S.outreach.filter(o=>o.replied_at).length, ready=S.merchants.filter(m=>["qualified","outreach_ready"].includes(m.lifecycle_stage)).length;
  const rev=S.revenue.reduce((a,x)=>a+Number(x.amount||0),0), follow=S.outreach.filter(o=>o.follow_up_at&&new Date(o.follow_up_at)<=new Date()&&!o.replied_at).length;
  const acts=S.events.slice(0,6);
  return pageIntro("overview","Your merchant network, in motion.","See what changed, what needs attention and where the next revenue opportunity is—without turning Lumina View into a traditional CRM.",`<button class="secondary" data-action="open-ai">${icon("sparkles")} Ask View AI</button><button class="primary" data-page="discover">Discover</button>`)
  +`<section class="grid">
    ${metric("Merchants",S.merchants.length,"Canonical merchant identities")}
    ${metric("Ready to reach",ready,"Qualified or outreach-ready")}
    ${metric("Replies",replies,`${follow} follow-ups due`)}
    ${metric("Revenue tracked",euro(rev),"Across all recorded routes")}
    <article class="card c8"><div class="card-head"><div><h3>Network pulse</h3><small>Live operating rhythm</small></div><button class="text-link" data-page="automations">Open engine</button></div>${bars([28,35,32,47,43,58,52,66,61,73,69,82,76,91])}</article>
    <article class="card c4"><div class="card-head"><div><h3>Today in View</h3><small>Highest priority</small></div></div><div class="split"><div class="stat-box"><b>${S.jobs.filter(j=>j.status==="queued").length}</b><span>Queued jobs</span></div><div class="stat-box"><b>${S.bookings.filter(b=>b.status==="new").length}</b><span>New bookings</span></div><div class="stat-box"><b>${S.outreach.filter(o=>o.status==="draft").length}</b><span>Drafts</span></div><div class="stat-box"><b>${S.programs.length}</b><span>Program routes</span></div></div></article>
    <article class="card c7"><div class="card-head"><div><h3>Opportunity stream</h3><small>Merchants worth opening now</small></div><button class="text-link" data-page="intelligence">Open intelligence</button></div>${S.merchants.length?`<div class="merchant-grid" style="grid-template-columns:1fr 1fr">${[...S.merchants].sort((a,b)=>(b.priority||0)-(a.priority||0)).slice(0,4).map(merchantCard).join("")}</div>`:empty("store","Your graph is empty","Add or import merchants and Lumina View will start building intelligence around them.",`<button class="primary" data-action="add-merchant">Add first merchant</button>`)}</article>
    <article class="card c5"><div class="card-head"><div><h3>Recent activity</h3><small>Audit trail</small></div></div>${acts.length?`<div class="activity">${acts.map(a=>`<div class="activity-item"><div class="activity-icon">${icon(eventIcon(a.event_type))}</div><div class="activity-main"><b>${esc(a.event_type.replaceAll("_"," "))}</b><span>${esc(a.actor||"Lumina View")}</span></div><div class="time">${fmtDate(a.created_at)}</div></div>`).join("")}</div>`:empty("activity","Nothing yet","Actions in View will appear here as a clean, auditable timeline.")}</article>
  </section>`;
}
function eventIcon(t=""){if(t.includes("outreach"))return"send";if(t.includes("analy"))return"brain-circuit";if(t.includes("merchant"))return"store";return"activity"}
function discoverPage(){
  return pageIntro("discover","Turn commerce into a merchant graph.","Bring in brands broadly, preserve source evidence, deduplicate by domain and let response data—not over-filtering—teach us what converts.",`<button class="secondary" data-action="import-csv">${icon("upload")} Import CSV</button><button class="secondary" data-action="queue-discovery">${icon("radar")} Queue discovery</button><button class="primary" data-action="add-merchant">+ Add merchant</button>`)
  +`<section class="grid">
    <article class="card full"><div class="card-head"><div><h3>Source coverage</h3><small>Connector registry</small></div><span class="pill green">${S.settings.discovery_daily_target||2000}/day target</span></div><div class="source-grid">${S.sources.map(s=>`<div class="source-card"><span class="source-status ${s.status==="active"?"active":s.status==="beta"?"beta":""}"></span><b>${esc(s.name)}</b><span>${esc(s.source_type)} · ${esc(s.status)}</span></div>`).join("")}</div></article>
    <article class="card c8"><div class="card-head"><div><h3>Merchant graph</h3><small>${S.merchants.length} merchant${S.merchants.length===1?"":"s"}</small></div></div>${S.merchants.length?`<div class="merchant-grid">${S.merchants.map(merchantCard).join("")}</div>`:empty("radar","Nothing discovered yet","Import a CSV, add a merchant manually, or queue a discovery job.",`<button class="primary" data-action="import-csv">Import leads</button>`)}</article>
    <article class="card c4"><div class="card-head"><div><h3>Discovery jobs</h3><small>Latest queue state</small></div></div>${jobList(S.jobs.filter(j=>j.job_type==="DISCOVER_MERCHANTS").slice(0,8))}</article>
  </section>`;
}
function intelligencePage(){
  const scored=S.merchants.filter(m=>scoreMap()[m.id]);
  return pageIntro("intelligence","Understand the merchant before you pitch.","Every score is explainable. View chooses the offer because the evidence supports it—not because a generic ICP said so.",`<button class="secondary" data-action="analyze-unscored">${icon("sparkles")} Analyze unscored</button><button class="primary" data-action="open-ai">${icon("brain-circuit")} Ask View AI</button>`)
  +`<section class="grid">
    ${metric("Analyzed",scored.length,`${S.merchants.length-scored.length} waiting`)}
    ${metric("High fit",S.scores.filter(s=>(s.lumina_fit||0)>=80).length,"Lumina Fit ≥ 80")}
    ${metric("Fitting Room",S.scores.filter(s=>(s.fitting_room_fit||0)>=80).length,"Strong fashion fit")}
    ${metric("UGC",S.scores.filter(s=>(s.ugc_opportunity||0)>=85).length,"Strong creative opportunity")}
    <article class="card full"><div class="card-head"><div><h3>Merchant intelligence</h3><small>Tap any merchant to open Merchant 360</small></div></div>${S.merchants.length?`<div class="merchant-grid">${[...S.merchants].sort((a,b)=>(scoreMap()[b.id]?.lumina_fit||0)-(scoreMap()[a.id]?.lumina_fit||0)).map(merchantCard).join("")}</div>`:empty("brain-circuit","No merchants to analyze","Add merchants in Discover first.")}</article>
  </section>`;
}
