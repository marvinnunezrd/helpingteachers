(function () {
  const TEACHER_NAME_KEY = "helpingTeachersTeacherName";

  const yearEls = document.querySelectorAll("[data-year], #year");
  yearEls.forEach((yearEl) => {
    yearEl.textContent = new Date().getFullYear();
  });

  const text = getAuthText();
  const mainScript = document.currentScript || Array.from(document.scripts).find((script) => {
    return script.src && script.src.includes("/js/main.js");
  });

  const jsBaseUrl = mainScript
    ? new URL(".", mainScript.src).href
    : new URL("./js/", window.location.href).href;

  const sharedAuthState = {
    client: null,
    session: null,
    configured: false,
    loading: true,
    ready: false
  };
  const authSubscribers = [];

  window.HelpingTeachersAuth = {
    onReady(callback) {
      if (typeof callback !== "function") return () => {};
      authSubscribers.push(callback);
      if (sharedAuthState.ready) callback(getAuthContext());
      return () => {
        const index = authSubscribers.indexOf(callback);
        if (index >= 0) authSubscribers.splice(index, 1);
      };
    },
    getClient() { return sharedAuthState.client; },
    getSession() { return sharedAuthState.session; },
    isSignedIn() { return Boolean(sharedAuthState.session); },
    getDisplayName() { return getTeacherDisplayName(sharedAuthState.session); },
    saveTeacherProfile(profile) { return saveTeacherProfile(sharedAuthState, profile); },
    getToolSetting(toolKey, settingKey) { return getToolSetting(sharedAuthState, toolKey, settingKey); },
    saveToolSetting(toolKey, settingKey, data) { return saveToolSetting(sharedAuthState, toolKey, settingKey, data); }
  };

  loadScript(`${jsBaseUrl}auth-config.js`)
    .catch(() => null)
    .then(() => initAuthShell(window.HELPING_TEACHERS_AUTH || {}));

  // ─── Text strings ──────────────────────────────────────────────────────────

  function getAuthText() {
    const isSpanish = document.documentElement.lang &&
      document.documentElement.lang.toLowerCase().startsWith("es");

    return isSpanish
      ? {
          triggerSignIn: "Iniciar sesión",
          signedIn: "Sesión iniciada",
          signOut: "Cerrar sesión",
          modalTitle: "Iniciar sesión",
          modalIntro: "Puedes usar las herramientas sin cuenta. Inicia sesión solo si quieres guardar preferencias, listas o configuraciones.",
          connectedTitle: "Login opcional activo",
          connectedMessage: "Las herramientas siguen disponibles sin cuenta. Tu sesión solo se usa para guardar y sincronizar cuando tú lo decidas.",
          pendingTitle: "Login no conectado aún",
          pendingMessage: "Las herramientas siguen disponibles sin cuenta. Cuando conectes Supabase, este panel permitirá iniciar sesión.",
          google: "Continuar con Google",
          microsoft: "Continuar con Microsoft",
          comingSoon: "próximamente",
          orDivider: "o",
          tabSignIn: "Iniciar sesión",
          tabSignUp: "Crear cuenta",
          emailLabel: "Correo electrónico",
          emailPlaceholder: "tu@email.com",
          passwordLabel: "Contraseña",
          passwordPlaceholder: "Contraseña",
          passwordNewPlaceholder: "Contraseña (mín. 6 caracteres)",
          signInButton: "Iniciar sesión",
          signUpButton: "Crear cuenta",
          forgotPassword: "¿Olvidaste tu contraseña?",
          forgotTitle: "Recuperar acceso",
          forgotHelp: "Ingresa tu correo y te enviamos un enlace para iniciar sesión.",
          sendLinkButton: "Enviar enlace",
          backToSignIn: "Volver a iniciar sesión",
          checkEmail: "Revisa tu correo. Te enviamos un enlace para entrar.",
          checkEmailConfirm: "Revisa tu correo para confirmar tu cuenta. Luego podrás iniciar sesión.",
          signingIn: "Iniciando sesión...",
          signingUp: "Creando cuenta...",
          sending: "Enviando...",
          error: "No se pudo completar la acción. Intenta de nuevo.",
          authErrorPrefix: "Error:",
          authLoading: "El login todavía está cargando. Intenta de nuevo en unos segundos.",
          requestTimeout: "El servicio de login no respondió. Revisa tu internet e intenta de nuevo.",
          close: "Cerrar",
          displayNameTitle: "Nombre para mostrar",
          displayNameHelp: "Elige cómo quieres que aparezcas en la barra superior.",
          titleLabel: "Título",
          titlePlaceholder: "Título",
          nameLabel: "Nombre o apellido",
          namePlaceholder: "Ej. Núñez",
          saveName: "Guardar nombre",
          nameSaved: "Nombre guardado.",
          nameSavedLocal: "Nombre guardado en este navegador.",
          displayNameOptions: ["Mr.", "Ms.", "Mrs.", "Mx.", "Dr.", "Coach"],
          teacherFallback: "Teacher"
        }
      : {
          triggerSignIn: "Sign in",
          signedIn: "Signed in",
          signOut: "Sign out",
          modalTitle: "Sign in",
          modalIntro: "You can use the tools without an account. Sign in only if you want to save preferences, lists, schedules, or tool settings.",
          connectedTitle: "Optional login is active",
          connectedMessage: "Tools remain available without an account. Your session is only used to save and sync when you choose to.",
          pendingTitle: "Login not connected yet",
          pendingMessage: "Tools remain available without an account. Once Supabase is connected, teachers can sign in to save data.",
          google: "Continue with Google",
          microsoft: "Continue with Microsoft",
          comingSoon: "coming soon",
          orDivider: "or",
          tabSignIn: "Sign in",
          tabSignUp: "Create account",
          emailLabel: "Email",
          emailPlaceholder: "you@email.com",
          passwordLabel: "Password",
          passwordPlaceholder: "Password",
          passwordNewPlaceholder: "Password (min. 6 characters)",
          signInButton: "Sign in",
          signUpButton: "Create account",
          forgotPassword: "Forgot password?",
          forgotTitle: "Reset password",
          forgotHelp: "Enter your email and we'll send you a sign-in link.",
          sendLinkButton: "Send link",
          backToSignIn: "Back to sign in",
          checkEmail: "Check your email — we sent you a sign-in link.",
          checkEmailConfirm: "Check your email to confirm your account. Then you can sign in.",
          signingIn: "Signing in...",
          signingUp: "Creating account...",
          sending: "Sending...",
          error: "Something went wrong. Please try again.",
          authErrorPrefix: "Error:",
          authLoading: "Login is still loading. Try again in a few seconds.",
          requestTimeout: "The login service did not respond. Check your internet and try again.",
          close: "Close",
          displayNameTitle: "Display name",
          displayNameHelp: "Choose how you want to appear in the top bar.",
          titleLabel: "Title",
          titlePlaceholder: "Title",
          nameLabel: "Name or last name",
          namePlaceholder: "Ex. Smith",
          saveName: "Save name",
          nameSaved: "Name saved.",
          nameSavedLocal: "Name saved in this browser.",
          displayNameOptions: ["Mr.", "Ms.", "Mrs.", "Mx.", "Dr.", "Coach"],
          teacherFallback: "Teacher"
        };
  }

  // ─── Script loader ─────────────────────────────────────────────────────────

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (Array.from(document.scripts).some((s) => s.src === src)) { resolve(); return; }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // ─── Init ──────────────────────────────────────────────────────────────────

  function initAuthShell(config) {
    const navbar = document.querySelector(".navbar");
    if (!navbar || document.querySelector(".auth-trigger")) return;

    const navActions = getOrCreateNavActions(navbar);
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "auth-trigger";
    trigger.textContent = text.triggerSignIn;
    trigger.setAttribute("aria-haspopup", "dialog");

    Object.assign(sharedAuthState, {
      client: null,
      session: null,
      configured: isAuthConfigured(config),
      loading: isAuthConfigured(config),
      ready: false
    });
    const authState = sharedAuthState;

    const modal = createAuthModal(config, authState.configured);
    document.body.appendChild(modal);
    navActions.appendChild(trigger);

    trigger.addEventListener("click", () => openModal(modal));
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest("[data-auth-close]")) closeModal(modal);
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(modal); });

    wireAuthActions(modal, config, authState, trigger);

    if (!authState.configured) {
      authState.loading = false;
      updateAuthButton(trigger, null);
      notifyAuthSubscribers();
      return;
    }

    loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2")
      .then(() => {
        authState.client = window.supabase.createClient(
          config.supabaseUrl,
          config.supabaseAnonKey,
          {
            auth: {
              storageKey: "helping-teachers-auth-session",
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true,
              flowType: "pkce"
            }
          }
        );
        return authState.client.auth.getSession();
      })
      .then(async ({ data }) => {
        authState.loading = false;
        authState.session = data.session;
        await loadTeacherProfile(authState);
        updateAuthButton(trigger, authState.session);

        authState.client.auth.onAuthStateChange(async (_event, session) => {
          authState.session = session;
          await loadTeacherProfile(authState);
          updateAuthButton(trigger, session);
          updateSignedInView(modal, session, trigger);
          notifyAuthSubscribers();
        });

        updateSignedInView(modal, authState.session, trigger);
        notifyAuthSubscribers();
      })
      .catch(() => {
        authState.loading = false;
        authState.configured = false;
        setConnectionNotice(modal, false);
        showAuthMessage(modal, text.error, "error");
        updateAuthButton(trigger, null);
        notifyAuthSubscribers();
      });
  }

  function getOrCreateNavActions(navbar) {
    let navActions = navbar.querySelector(".nav-actions");
    if (navActions) return navActions;

    navActions = document.createElement("div");
    navActions.className = "nav-actions";
    Array.from(navbar.children)
      .filter((c) => c.classList && c.classList.contains("language-switch"))
      .forEach((c) => navActions.appendChild(c));
    navbar.appendChild(navActions);
    return navActions;
  }

  // ─── Modal HTML ────────────────────────────────────────────────────────────

  function createAuthModal(config, configured) {
    const providerConfig = getProviderConfig(config);
    const modal = document.createElement("div");
    modal.className = "auth-modal";
    modal.hidden = true;

    const googleBtn = renderProviderButton("google", text.google, providerConfig.google, configured);
    const microsoftBtn = renderProviderButton("azure", text.microsoft, providerConfig.microsoft, configured);
    const hasOAuth = configured && (providerConfig.google || providerConfig.microsoft);
    const divider = hasOAuth
      ? `<div class="auth-divider"><span>${text.orDivider}</span></div>`
      : "";

    modal.innerHTML = `
      <div class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
        <button type="button" class="auth-close" data-auth-close aria-label="${text.close}">×</button>
        <h2 id="authModalTitle">${text.modalTitle}</h2>
        <p class="auth-intro">${text.modalIntro}</p>

        <div class="auth-pending" data-auth-status>
          <strong data-auth-status-title></strong>
          <span data-auth-status-message></span>
        </div>

        <div class="auth-user" data-auth-user hidden></div>

        <form class="auth-display-form" data-auth-display-form hidden>
          <strong>${text.displayNameTitle}</strong>
          <span>${text.displayNameHelp}</span>
          <div class="auth-display-row">
            <label>
              ${text.titleLabel}
              <select data-auth-display-title>
                <option value="">${text.titlePlaceholder}</option>
                ${text.displayNameOptions.map((o) => `<option value="${o}">${o}</option>`).join("")}
              </select>
            </label>
            <label>
              ${text.nameLabel}
              <input type="text" data-auth-display-name placeholder="${text.namePlaceholder}" autocomplete="name">
            </label>
          </div>
          <button type="submit" class="btn btn-primary">${text.saveName}</button>
        </form>

        <div data-auth-forms>
          <div class="auth-actions-stack">
            ${googleBtn}
            ${microsoftBtn}
          </div>

          ${divider}

          <div class="auth-tabs" role="tablist">
            <button type="button" class="auth-tab-btn active" data-auth-tab="signin" role="tab" aria-selected="true">${text.tabSignIn}</button>
            <button type="button" class="auth-tab-btn" data-auth-tab="signup" role="tab" aria-selected="false">${text.tabSignUp}</button>
          </div>

          <form class="auth-form-section" data-auth-signin-form>
            <div class="auth-input-group">
              <label for="authSigninEmail">${text.emailLabel}</label>
              <input id="authSigninEmail" type="email" placeholder="${text.emailPlaceholder}" autocomplete="email" ${configured ? "" : "disabled"} required>
            </div>
            <div class="auth-input-group">
              <label for="authSigninPassword">${text.passwordLabel}</label>
              <input id="authSigninPassword" type="password" placeholder="${text.passwordPlaceholder}" autocomplete="current-password" ${configured ? "" : "disabled"} required>
            </div>
            <button type="submit" class="btn btn-primary" ${configured ? "" : "disabled"}>${text.signInButton}</button>
            <div class="auth-link-row">
              <button type="button" class="auth-text-link" data-show-forgot>${text.forgotPassword}</button>
            </div>
          </form>

          <form class="auth-form-section" data-auth-signup-form hidden>
            <div class="auth-input-group">
              <label for="authSignupEmail">${text.emailLabel}</label>
              <input id="authSignupEmail" type="email" placeholder="${text.emailPlaceholder}" autocomplete="email" ${configured ? "" : "disabled"} required>
            </div>
            <div class="auth-input-group">
              <label for="authSignupPassword">${text.passwordLabel}</label>
              <input id="authSignupPassword" type="password" placeholder="${text.passwordNewPlaceholder}" autocomplete="new-password" minlength="6" ${configured ? "" : "disabled"} required>
            </div>
            <button type="submit" class="btn btn-primary" ${configured ? "" : "disabled"}>${text.signUpButton}</button>
          </form>

          <form class="auth-form-section" data-auth-forgot-form hidden>
            <p class="auth-forgot-help">${text.forgotHelp}</p>
            <div class="auth-input-group">
              <label for="authForgotEmail">${text.emailLabel}</label>
              <input id="authForgotEmail" type="email" placeholder="${text.emailPlaceholder}" autocomplete="email" ${configured ? "" : "disabled"} required>
            </div>
            <button type="submit" class="btn btn-primary" ${configured ? "" : "disabled"}>${text.sendLinkButton}</button>
            <div class="auth-link-row">
              <button type="button" class="auth-text-link" data-show-signin>${text.backToSignIn}</button>
            </div>
          </form>
        </div>

        <p class="auth-message" data-auth-message aria-live="polite"></p>

        <button type="button" class="btn btn-secondary auth-signout" data-auth-signout hidden>${text.signOut}</button>
      </div>
    `;

    setConnectionNotice(modal, configured);
    return modal;
  }

  function renderProviderButton(provider, label, enabled, configured) {
    const disabled = !configured || !enabled;
    const suffix = configured && !enabled ? ` <span>${text.comingSoon}</span>` : "";
    const icon = provider === "google" ? googleIcon() : microsoftIcon();
    return `
      <button type="button" class="btn btn-light btn-provider" data-auth-provider="${provider}" ${disabled ? "disabled" : ""}>
        ${icon}<span>${label}${suffix}</span>
      </button>
    `;
  }

  function googleIcon() {
    return `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>`;
  }

  function microsoftIcon() {
    return `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="1" y="1" width="7.5" height="7.5" fill="#F25022"/>
      <rect x="9.5" y="1" width="7.5" height="7.5" fill="#7FBA00"/>
      <rect x="1" y="9.5" width="7.5" height="7.5" fill="#00A4EF"/>
      <rect x="9.5" y="9.5" width="7.5" height="7.5" fill="#FFB900"/>
    </svg>`;
  }

  // ─── Wire actions ──────────────────────────────────────────────────────────

  function wireAuthActions(modal, config, authState, trigger) {
    // Tabs
    modal.querySelectorAll("[data-auth-tab]").forEach((tabBtn) => {
      tabBtn.addEventListener("click", () => {
        const tab = tabBtn.dataset.authTab;
        switchTab(modal, tab);
        showAuthMessage(modal, "");
      });
    });

    // Show forgot / back to sign in
    modal.querySelector("[data-show-forgot]").addEventListener("click", () => {
      showForgotForm(modal);
      showAuthMessage(modal, "");
    });
    modal.querySelector("[data-show-signin]").addEventListener("click", () => {
      showTabForms(modal);
      switchTab(modal, "signin");
      showAuthMessage(modal, "");
    });

    // OAuth providers
    modal.querySelectorAll("[data-auth-provider]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!authState.client || button.disabled) return;
        const provider = button.dataset.authProvider;
        const oauthOptions = { redirectTo: getRedirectUrl(config) };
        if (provider === "azure") oauthOptions.scopes = "openid profile email User.Read";
        const { error } = await authState.client.auth.signInWithOAuth({
          provider,
          options: oauthOptions
        });
        if (error) showAuthMessage(modal, getAuthErrorMessage(error), "error");
      });
    });

    // Sign in form
    modal.querySelector("[data-auth-signin-form]").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!authState.client) {
        showAuthMessage(modal, authState.loading ? text.authLoading : text.error, "error");
        return;
      }
      const email = modal.querySelector("#authSigninEmail").value.trim();
      const password = modal.querySelector("#authSigninPassword").value;
      const btn = modal.querySelector("[data-auth-signin-form] button[type=submit]");

      setButtonLoading(btn, text.signingIn);
      showAuthMessage(modal, "");
      try {
        const { error } = await withTimeout(
          authState.client.auth.signInWithPassword({ email, password }),
          15000
        );
        if (error) {
          showAuthMessage(modal, getAuthErrorMessage(error), "error");
        } else {
          closeModal(modal);
        }
      } catch (err) {
        showAuthMessage(modal, getAuthErrorMessage(err), "error");
      } finally {
        resetButton(btn, text.signInButton);
      }
    });

    // Sign up form
    modal.querySelector("[data-auth-signup-form]").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!authState.client) {
        showAuthMessage(modal, authState.loading ? text.authLoading : text.error, "error");
        return;
      }
      const email = modal.querySelector("#authSignupEmail").value.trim();
      const password = modal.querySelector("#authSignupPassword").value;
      const btn = modal.querySelector("[data-auth-signup-form] button[type=submit]");

      setButtonLoading(btn, text.signingUp);
      showAuthMessage(modal, "");
      try {
        const { data, error } = await withTimeout(
          authState.client.auth.signUp({ email, password }),
          15000
        );
        if (error) {
          showAuthMessage(modal, getAuthErrorMessage(error), "error");
        } else if (data.session) {
          closeModal(modal);
        } else {
          showAuthMessage(modal, text.checkEmailConfirm, "success");
        }
      } catch (err) {
        showAuthMessage(modal, getAuthErrorMessage(err), "error");
      } finally {
        resetButton(btn, text.signUpButton);
      }
    });

    // Forgot password form
    modal.querySelector("[data-auth-forgot-form]").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!authState.client) {
        showAuthMessage(modal, authState.loading ? text.authLoading : text.error, "error");
        return;
      }
      const email = modal.querySelector("#authForgotEmail").value.trim();
      const btn = modal.querySelector("[data-auth-forgot-form] button[type=submit]");

      setButtonLoading(btn, text.sending);
      showAuthMessage(modal, "");
      try {
        const { error } = await withTimeout(
          authState.client.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: getRedirectUrl(config) }
          }),
          15000
        );
        showAuthMessage(modal, error ? getAuthErrorMessage(error) : text.checkEmail, error ? "error" : "success");
        if (!error) modal.querySelector("#authForgotEmail").value = "";
      } catch (err) {
        showAuthMessage(modal, getAuthErrorMessage(err), "error");
      } finally {
        resetButton(btn, text.sendLinkButton);
      }
    });

    // Display name form
    modal.querySelector("[data-auth-display-form]").addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = modal.querySelector("[data-auth-display-title]").value.trim();
      const name = modal.querySelector("[data-auth-display-name]").value.trim();
      const profile = { title, name };

      saveTeacherDisplayName(profile);
      updateAuthButton(trigger, authState.session);
      updateSignedInView(modal, authState.session, trigger);

      let saveResult = { error: null };
      try {
        saveResult = await saveTeacherProfile(authState, profile);
      } catch (err) {
        saveResult = { error: err };
      }
      showAuthMessage(modal, saveResult.error ? text.nameSavedLocal : text.nameSaved, "success");
      notifyAuthSubscribers();
    });

    // Sign out
    modal.querySelector("[data-auth-signout]").addEventListener("click", async () => {
      if (!authState.client) return;
      await authState.client.auth.signOut();
      authState.session = null;
      updateAuthButton(trigger, null);
      updateSignedInView(modal, null, trigger);
      notifyAuthSubscribers();
    });
  }

  // ─── Tab helpers ───────────────────────────────────────────────────────────

  function switchTab(modal, tab) {
    modal.querySelectorAll("[data-auth-tab]").forEach((btn) => {
      const active = btn.dataset.authTab === tab;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    const signinForm = modal.querySelector("[data-auth-signin-form]");
    const signupForm = modal.querySelector("[data-auth-signup-form]");
    signinForm.hidden = tab !== "signin";
    signupForm.hidden = tab !== "signup";
  }

  function showForgotForm(modal) {
    modal.querySelector(".auth-tabs").hidden = true;
    modal.querySelector("[data-auth-signin-form]").hidden = true;
    modal.querySelector("[data-auth-signup-form]").hidden = true;
    modal.querySelector("[data-auth-forgot-form]").hidden = false;
  }

  function showTabForms(modal) {
    modal.querySelector(".auth-tabs").hidden = false;
    modal.querySelector("[data-auth-forgot-form]").hidden = true;
  }

  // ─── Button state helpers ──────────────────────────────────────────────────

  function setButtonLoading(btn, loadingText) {
    btn._originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = loadingText;
  }

  function resetButton(btn, fallbackText) {
    btn.disabled = false;
    btn.textContent = btn._originalText || fallbackText;
  }

  // ─── Auth helpers ──────────────────────────────────────────────────────────

  function isAuthConfigured(config) {
    return Boolean(
      config &&
      config.enabled &&
      config.supabaseUrl &&
      config.supabaseAnonKey &&
      !String(config.supabaseUrl).includes("YOUR_") &&
      !String(config.supabaseAnonKey).includes("YOUR_")
    );
  }

  function getProviderConfig(config) {
    const providers = config && config.providers ? config.providers : {};
    return {
      google: providers.google === true,
      microsoft: providers.microsoft === true || providers.azure === true
    };
  }

  async function finishAuthRedirect(authState) {
    if (!authState.client) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) return;
    try {
      await authState.client.auth.exchangeCodeForSession(code);
      params.delete("code");
      const cleanQuery = params.toString();
      const cleanUrl = window.location.pathname + (cleanQuery ? `?${cleanQuery}` : "") + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (_) {
      // Supabase may have already processed the code; getSession still runs next.
    }
  }

  function getRedirectUrl(config) {
    if (config.redirectTo) return config.redirectTo;
    return window.location.origin + window.location.pathname;
  }

  function getAuthContext() {
    return {
      client: sharedAuthState.client,
      session: sharedAuthState.session,
      configured: sharedAuthState.configured,
      loading: sharedAuthState.loading,
      signedIn: Boolean(sharedAuthState.session)
    };
  }

  function notifyAuthSubscribers() {
    sharedAuthState.ready = true;
    const context = getAuthContext();
    authSubscribers.forEach((cb) => cb(context));
    document.dispatchEvent(new CustomEvent("helpingteachers:auth", { detail: context }));
  }

  // ─── Teacher profile ───────────────────────────────────────────────────────

  async function loadTeacherProfile(authState) {
    if (!authState.client || !authState.session) return;
    const { data, error } = await authState.client
      .from("teacher_profiles")
      .select("title,name,display_name,preferred_language")
      .eq("id", authState.session.user.id)
      .maybeSingle();
    if (!error && data && data.name) {
      saveTeacherDisplayName({ title: data.title || "", name: data.name });
    }
  }

  async function saveTeacherProfile(authState, profile) {
    if (!authState.client || !authState.session) return { error: new Error("Not signed in") };
    const title = profile.title || "";
    const name = profile.name || "";
    const displayName = [title, name].filter(Boolean).join(" ");
    try {
      return await authState.client.from("teacher_profiles").upsert({
        id: authState.session.user.id,
        email: authState.session.user.email,
        title,
        name,
        display_name: displayName,
        preferred_language: document.documentElement.lang || "en",
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      return { error: err };
    }
  }

  async function getToolSetting(authState, toolKey, settingKey) {
    if (!authState.client || !authState.session) return { data: null, error: new Error("Not signed in") };
    try {
      const { data, error } = await authState.client
        .from("teacher_tool_settings")
        .select("data")
        .eq("user_id", authState.session.user.id)
        .eq("tool_key", toolKey)
        .eq("setting_key", settingKey)
        .maybeSingle();
      return { data: data ? data.data : null, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async function saveToolSetting(authState, toolKey, settingKey, data) {
    if (!authState.client || !authState.session) return { error: new Error("Not signed in") };
    try {
      return await authState.client.from("teacher_tool_settings").upsert({
        user_id: authState.session.user.id,
        tool_key: toolKey,
        setting_key: settingKey,
        data,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id,tool_key,setting_key" });
    } catch (err) {
      return { error: err };
    }
  }

  // ─── UI update helpers ─────────────────────────────────────────────────────

  function updateAuthButton(trigger, session) {
    if (!session) {
      trigger.textContent = text.triggerSignIn;
      trigger.classList.remove("auth-trigger-signed-in");
      return;
    }
    trigger.textContent = getTeacherDisplayName(session);
    trigger.classList.add("auth-trigger-signed-in");
  }

  function updateSignedInView(modal, session, trigger) {
    const userBox = modal.querySelector("[data-auth-user]");
    const signOutBtn = modal.querySelector("[data-auth-signout]");
    const displayForm = modal.querySelector("[data-auth-display-form]");
    const authForms = modal.querySelector("[data-auth-forms]");
    const intro = modal.querySelector(".auth-intro");

    if (!session) {
      userBox.hidden = true;
      userBox.textContent = "";
      signOutBtn.hidden = true;
      displayForm.hidden = true;
      if (authForms) authForms.hidden = false;
      if (intro) intro.hidden = false;
      return;
    }

    hydrateTeacherDisplayForm(modal, session);
    userBox.hidden = false;
    userBox.textContent = `${text.signedIn}: ${getTeacherDisplayName(session)}`;
    signOutBtn.hidden = false;
    displayForm.hidden = false;
    if (authForms) authForms.hidden = true;
    if (intro) intro.hidden = true;
    updateAuthButton(trigger, session);
  }

  function getTeacherDisplayName(session) {
    const saved = readTeacherDisplayName();
    if (saved && saved.name) return [saved.title, saved.name].filter(Boolean).join(" ");

    const metadata = session && session.user ? session.user.user_metadata || {} : {};
    const fullName = metadata.full_name || metadata.name;
    if (fullName) return fullName;

    const email = session && session.user ? session.user.email || "" : "";
    const guessedName = guessReadableName(email.split("@")[0]);
    return guessedName || email || text.teacherFallback;
  }

  function guessReadableName(value) {
    if (!value) return "";
    const cleaned = value.replace(/[._-]+/g, " ").replace(/\d+/g, " ").trim();
    if (!cleaned) return "";
    return cleaned.split(/\s+/).slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  function hydrateTeacherDisplayForm(modal, session) {
    const saved = readTeacherDisplayName();
    const titleSelect = modal.querySelector("[data-auth-display-title]");
    const nameInput = modal.querySelector("[data-auth-display-name]");
    titleSelect.value = saved.title || "";
    nameInput.value = saved.name || "";
    if (!saved.name && session && session.user && session.user.email) {
      nameInput.placeholder = guessReadableName(session.user.email.split("@")[0]) || text.namePlaceholder;
    }
  }

  function readTeacherDisplayName() {
    try { return JSON.parse(localStorage.getItem(TEACHER_NAME_KEY)) || {}; }
    catch (_) { return {}; }
  }

  function saveTeacherDisplayName(value) {
    localStorage.setItem(TEACHER_NAME_KEY, JSON.stringify(value));
  }

  function setConnectionNotice(modal, configured) {
    const title = modal.querySelector("[data-auth-status-title]");
    const message = modal.querySelector("[data-auth-status-message]");
    title.textContent = configured ? text.connectedTitle : text.pendingTitle;
    message.textContent = configured ? text.connectedMessage : text.pendingMessage;
  }

  function showAuthMessage(modal, message, type) {
    const el = modal.querySelector("[data-auth-message]");
    el.textContent = message;
    el.className = "auth-message" + (type ? ` auth-message-${type}` : "");
  }

  function getAuthErrorMessage(error) {
    if (!error || !error.message) return text.error;
    if (error.name === "TimeoutError") return text.requestTimeout;
    return `${text.authErrorPrefix} ${error.message}`;
  }

  function withTimeout(promise, timeoutMs) {
    let id;
    const timeout = new Promise((_, reject) => {
      id = window.setTimeout(() => {
        const e = new Error("Request timed out");
        e.name = "TimeoutError";
        reject(e);
      }, timeoutMs);
    });
    return Promise.race([promise, timeout]).finally(() => window.clearTimeout(id));
  }

  function openModal(modal) {
    modal.hidden = false;
    document.body.classList.add("auth-modal-open");
    const first = modal.querySelector("button:not([disabled]), input:not([disabled])");
    if (first) first.focus();
  }

  function closeModal(modal) {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("auth-modal-open");
  }
})();
