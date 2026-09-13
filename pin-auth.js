// Secure PIN login override for Lumina View.
// The PIN is verified server-side by the Supabase Edge Function `view-pin-login`.
// No PIN is stored in this client file.

S.pinMode = true;

function renderAuth(){
  root(`<section class="auth">
    <div class="auth-shell">
      <div class="auth-art">
        <div class="auth-logo"><span class="auth-orb">L</span> Lumina View</div>
        <h1>Private operator access.</h1>
        <p>Open Lumina View with your private six-digit access code. Email delivery is not required.</p>
        <div class="auth-proof"><span>Private PIN</span><span>Rate limited</span><span>Server verified</span><span>Owner workspace</span></div>
      </div>
      <div class="auth-form">
        <div class="eyebrow">Lumina View</div>
        <h2>${S.pinMode ? "Enter access code" : "Welcome back"}</h2>
        <p>${S.pinMode ? "Use your private 6-digit code to open the workspace." : "Use your account email and password."}</p>

        ${S.pinMode ? `
          <form id="pinForm">
            <div class="field"><label>6-digit code</label><input id="accessPin" type="tel" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" placeholder="••••••" required style="font-size:26px;letter-spacing:.32em;text-align:center"></div>
            <button class="primary" id="pinSubmit" type="submit">Open Lumina View</button>
          </form>
          <div class="auth-switch">Prefer your account login? <button type="button" id="switchToPassword">Use email & password</button></div>
        ` : `
          <form id="authForm">
            <div class="field"><label>Email</label><input id="authEmail" type="email" required autocomplete="email"></div>
            <div class="field"><label>Password</label><input id="authPassword" type="password" minlength="8" required autocomplete="current-password"></div>
            <button class="primary" type="submit">Sign in</button>
          </form>
          <div class="auth-switch">Use your private code instead? <button type="button" id="switchToPin">Enter PIN</button></div>
        `}
      </div>
    </div>
  </section>`);

  if(S.pinMode){
    const input=document.getElementById("accessPin");
    input?.focus();
    input?.addEventListener("input",()=>{ input.value=input.value.replace(/\D/g,"").slice(0,6); });
    document.getElementById("pinForm").onsubmit=pinSubmit;
    document.getElementById("switchToPassword").onclick=()=>{S.pinMode=false;renderAuth()};
  }else{
    document.getElementById("authForm").onsubmit=authSubmit;
    document.getElementById("switchToPin").onclick=()=>{S.pinMode=true;renderAuth()};
  }
}

async function pinSubmit(e){
  e.preventDefault();
  const input=document.getElementById("accessPin");
  const button=document.getElementById("pinSubmit");
  const pin=(input?.value||"").trim();
  if(!/^\d{6}$/.test(pin)) return toast("Enter your 6-digit code.","bad");

  button.disabled=true;
  button.textContent="Opening…";
  try{
    const res=await fetch(`${SUPABASE_URL}/functions/v1/view-pin-login`,{
      method:"POST",
      headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY},
      body:JSON.stringify({pin})
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok){
      if(data.error==="too_many_attempts") throw new Error("Too many wrong attempts. Try again in about 15 minutes.");
      if(data.error==="invalid_pin") throw new Error(`Wrong code${Number.isFinite(data.remaining)?` · ${data.remaining} attempt${data.remaining===1?"":"s"} left`:""}.`);
      throw new Error("Could not verify the code.");
    }

    const {error}=await sb.auth.verifyOtp({token_hash:data.token_hash,type:"magiclink"});
    if(error) throw error;
    toast("Access granted.","good");
  }catch(err){
    toast(err.message||"PIN sign-in failed.","bad");
    button.disabled=false;
    button.textContent="Open Lumina View";
    input?.focus();
    input?.select();
  }
}
