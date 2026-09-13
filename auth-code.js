/* Mobile-friendly passwordless sign-in for Lumina View.
   Keeps the existing password flow but adds a one-time email code flow. */

S.authEmailTemp = S.authEmailTemp || "";

renderAuth = function(){
  const mode = S.authMode || "signin";
  const signup = mode === "signup";
  const code = mode === "code";
  const verify = mode === "verify";

  let form = "";
  if (verify) {
    form = `
      <form class="auth-form" id="codeVerifyForm">
        <div class="eyebrow">Private operator workspace</div>
        <h2>Enter your code</h2>
        <p>We sent a one-time sign-in code to <b>${esc(S.authEmailTemp)}</b>.</p>
        <div class="field"><label>6-digit code</label><input id="authOtp" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*" maxlength="8" placeholder="123456" required></div>
        <button class="primary" type="submit">Open Lumina View</button>
        <button class="secondary auth-wide" type="button" id="resendCode">Resend code</button>
        <div class="auth-switch">Wrong email? <button type="button" id="backToCode">Change email</button></div>
      </form>`;
  } else if (code) {
    form = `
      <form class="auth-form" id="codeRequestForm">
        <div class="eyebrow">Private operator workspace</div>
        <h2>Sign in with a code</h2>
        <p>Enter your email and we’ll send you a one-time code. No password needed on your phone.</p>
        <div class="field"><label>Email</label><input id="authCodeEmail" type="email" required autocomplete="email" value="${esc(S.authEmailTemp)}"></div>
        <button class="primary" type="submit">Send me a code</button>
        <button class="secondary auth-wide" type="button" id="usePassword">Use password instead</button>
      </form>`;
  } else {
    form = `
      <form class="auth-form" id="authForm">
        <div class="eyebrow">Private operator workspace</div>
        <h2>${signup ? "Create owner access" : "Welcome back"}</h2>
        <p>${signup ? "The first account becomes the Lumina View owner." : "Sign in to your internal merchant intelligence workspace."}</p>
        <div class="field"><label>Email</label><input id="authEmail" type="email" required autocomplete="email"></div>
        <div class="field"><label>Password</label><input id="authPassword" type="password" minlength="8" required autocomplete="${signup ? "new-password" : "current-password"}"></div>
        <button class="primary" type="submit">${signup ? "Create owner account" : "Sign in"}</button>
        ${signup ? "" : `<button class="secondary auth-wide" type="button" id="useCode">Sign in with email code</button>`}
        <div class="auth-switch">${signup ? "Already have access?" : "First time here?"} <button type="button" id="authSwitch">${signup ? "Sign in" : "Create owner account"}</button></div>
      </form>`;
  }

  root(`<section class="auth">
    <div class="auth-shell">
      <div class="auth-art">
        <div class="auth-logo"><span class="auth-orb">L</span> Lumina View</div>
        <h1>Commerce intelligence that actually moves.</h1>
        <p>Discover merchants, understand their opportunity, reach them with personalized value, build partnerships and track every revenue path.</p>
        <div class="auth-proof"><span>Merchant graph</span><span>View AI</span><span>Reach OS</span><span>Revenue attribution</span></div>
      </div>
      ${form}
    </div>
  </section>`);

  const authSwitch = document.getElementById("authSwitch");
  if (authSwitch) authSwitch.onclick = () => { S.authMode = signup ? "signin" : "signup"; renderAuth(); };

  const authForm = document.getElementById("authForm");
  if (authForm) authForm.onsubmit = authSubmit;

  const useCode = document.getElementById("useCode");
  if (useCode) useCode.onclick = () => { S.authMode = "code"; renderAuth(); };

  const usePassword = document.getElementById("usePassword");
  if (usePassword) usePassword.onclick = () => { S.authMode = "signin"; renderAuth(); };

  const backToCode = document.getElementById("backToCode");
  if (backToCode) backToCode.onclick = () => { S.authMode = "code"; renderAuth(); };

  const requestForm = document.getElementById("codeRequestForm");
  if (requestForm) requestForm.onsubmit = requestEmailCode;

  const verifyForm = document.getElementById("codeVerifyForm");
  if (verifyForm) verifyForm.onsubmit = verifyEmailCode;

  const resend = document.getElementById("resendCode");
  if (resend) resend.onclick = async () => {
    await sendEmailCode(S.authEmailTemp, true);
  };

  setTimeout(() => {
    const focusEl = document.getElementById(verify ? "authOtp" : code ? "authCodeEmail" : "authEmail");
    if (focusEl) focusEl.focus();
  }, 50);
};

async function sendEmailCode(email, resend=false){
  if (!email) return;
  try {
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }
    });
    if (error) throw error;
    S.authEmailTemp = email;
    S.authMode = "verify";
    renderAuth();
    toast(resend ? "A new code was sent." : "Check your email for your sign-in code.", "good");
  } catch (err) {
    toast(err.message || "Could not send sign-in code.", "bad");
  }
}

async function requestEmailCode(e){
  e.preventDefault();
  const email = document.getElementById("authCodeEmail")?.value.trim();
  await sendEmailCode(email);
}

async function verifyEmailCode(e){
  e.preventDefault();
  const token = document.getElementById("authOtp")?.value.trim();
  if (!token) return;
  try {
    const { error } = await sb.auth.verifyOtp({
      email: S.authEmailTemp,
      token,
      type: "email"
    });
    if (error) throw error;
    toast("Signed in.", "good");
  } catch (err) {
    toast(err.message || "That code is invalid or expired.", "bad");
  }
}
