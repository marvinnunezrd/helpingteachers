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
    getClient() {
      return sharedAuthState.client;
    },
    getSession() {
      return sharedAuthState.session;
    },
    isSignedIn() {
      return Boolean(sharedAuthState.session);
    },
    getDisplayName() {
      return getTeacherDisplayName(sharedAuthState.session);
    },
    saveTeacherProfile(profile) {
      return saveTeacherProfile(sharedAuthState, profile);
    },
    getToolSetting(toolKey, settingKey) {
      return getToolSetting(sharedAuthState, toolKey, settingKey);
    },
    saveToolSetting(toolKey, settingKey, data) {
      return saveToolSetting(sharedAuthState, toolKey, settingKey, data);
    }
  };

  loadScript(`${jsBaseUrl}auth-config.js`)
    .catch(() => null)
    .then(() => initAuthShell(window.HELPING_TEACHERS_AUTH || {}));

  function getAuthText() {
    const isSpanish = document.documentElement.lang &&
      document.documentElement.lang.toLowerCase().startsWith("es");

    return isSpanish
      ? {
          signIn: "Inicia sesión para guardar",
          signedIn: "Sesión iniciada",
          signOut: "Cerrar sesión",
          modalTitle: "Guardar y sincronizar",
          modalIntro: "Puedes usar las herramientas sin cuenta. Inicia sesión solo si quieres guardar preferencias, listas, horarios o configuraciones.",
          connectedTitle: "Login opcional activado",
          connectedMessage: "Las herramientas siguen disponibles sin cuenta. Tu sesión solo se usa para guardar y sincronizar cuando decidas hacerlo.",
          pendingTitle: "Login todavía no conectado",
          pendingMessage: "Las herramientas siguen disponibles sin cuenta. Cuando conectes Supabase, este panel permitirá iniciar sesión para guardar datos.",
          google: "Continuar con Google",
          microsoft: "Continuar con Microsoft",
          comingSoon: "próximamente",
          emailLabel: "Correo electrónico",
          emailPlaceholder: "tu@email.com",
          emailButton: "Enviar enlace seguro",
          checkEmail: "Te enviamos un enlace seguro. Revisa tu correo y ábrelo en este mismo navegador para completar el inicio de sesión.",
          error: "No se pudo iniciar sesión. Intenta de nuevo.",
          authErrorPrefix: "No se pudo enviar el enlace:",
          authLoading: "El login todavÃ­a estÃ¡ cargando. Intenta de nuevo en unos segundos.",
          sending: "Enviando...",
          requestTimeout: "El servicio de login no respondiÃ³. Revisa tu internet, espera unos segundos e intenta de nuevo.",
          close: "Cerrar",
          displayNameTitle: "Nombre para mostrar",
          displayNameHelp: "Elige cómo quieres que te mostremos en la barra superior. Solo se guarda en este navegador por ahora.",
          titleLabel: "Título",
          titlePlaceholder: "Título",
          nameLabel: "Nombre o apellido",
          namePlaceholder: "Ej. Nunez",
          saveName: "Guardar nombre",
          nameSaved: "Nombre guardado.",
          nameSavedLocal: "Nombre guardado en este navegador. El guardado en la nube no estÃ¡ disponible ahora mismo.",
          displayNameOptions: ["Mr.", "Ms.", "Mrs.", "Mx.", "Dr.", "Coach"],
          teacherFallback: "Teacher"
        }
      : {
          signIn: "Sign in to save",
          signedIn: "Signed in",
          signOut: "Sign out",
          modalTitle: "Save and sync",
          modalIntro: "You can use the tools without an account. Sign in only if you want to save preferences, lists, schedules, or tool settings.",
          connectedTitle: "Optional login is active",
          connectedMessage: "Tools remain available without an account. Your session is only used to save and sync when you choose to do that.",
          pendingTitle: "Login not connected yet",
          pendingMessage: "Tools remain available without an account. Once login is connected, this panel will let teachers sign in to save data.",
          google: "Continue with Google",
          microsoft: "Continue with Microsoft",
          comingSoon: "coming soon",
          emailLabel: "Email address",
          emailPlaceholder: "you@email.com",
          emailButton: "Send secure link",
          checkEmail: "We sent you a secure sign-in link. Check your email and open it in this same browser to finish signing in.",
          error: "We could not sign you in. Please try again.",
          authErrorPrefix: "We could not send the link:",
          authLoading: "Login is still loading. Try again in a few seconds.",
          sending: "Sending...",
          requestTimeout: "The login service did not respond. Check your internet, wait a few seconds, and try again.",
          close: "Close",
          displayNameTitle: "Display name",
          displayNameHelp: "Choose how you want to appear in the top bar. For now, this is saved only in this browser.",
          titleLabel: "Title",
          titlePlaceholder: "Title",
          nameLabel: "Name or last name",
          namePlaceholder: "Ex. Nunez",
          saveName: "Save name",
          nameSaved: "Name saved.",
          nameSavedLocal: "Name saved in this browser. Cloud save is not available right now.",
          displayNameOptions: ["Mr.", "Ms.", "Mrs.", "Mx.", "Dr.", "Coach"],
          teacherFallback: "Teacher"
        };
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (Array.from(document.scripts).some((script) => script.src === src)) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initAuthShell(config) {
    const navbar = document.querySelector(".navbar");

    if (!navbar || document.querySelector(".auth-trigger")) return;

    const navActions = getOrCreateNavActions(navbar);
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "auth-trigger";
    trigger.textContent = text.signIn;
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
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-auth-close]")) {
        closeModal(modal);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal(modal);
    });

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

        return finishAuthRedirect(authState).then(() => authState.client.auth.getSession());
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
        showAuthMessage(modal, text.error);
        updateAuthButton(trigger, null);
        notifyAuthSubscribers();
      });
  }

  function getOrCreateNavActions(navbar) {
    let navActions = navbar.querySelector(".nav-actions");

    if (navActions) return navActions;

    navActions = document.createElement("div");
    navActions.className = "nav-actions";

    const directActions = Array.from(navbar.children).filter((child) => {
      return child.classList && child.classList.contains("language-switch");
    });

    directActions.forEach((child) => navActions.appendChild(child));
    navbar.appendChild(navActions);

    return navActions;
  }

  function createAuthModal(config, configured) {
    const providerConfig = getProviderConfig(config);
    const modal = document.createElement("div");
    modal.className = "auth-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
        <button type="button" class="auth-close" data-auth-close aria-label="${text.close}">×</button>
        <h2 id="authModalTitle">${text.modalTitle}</h2>
        <p>${text.modalIntro}</p>

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
                ${text.displayNameOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}
              </select>
            </label>
            <label>
              ${text.nameLabel}
              <input type="text" data-auth-display-name placeholder="${text.namePlaceholder}" autocomplete="name">
            </label>
          </div>
          <button type="submit" class="btn btn-primary">${text.saveName}</button>
        </form>

        <div class="auth-actions-stack">
          ${renderProviderButton("google", text.google, providerConfig.google, configured)}
          ${renderProviderButton("azure", text.microsoft, providerConfig.microsoft, configured)}
        </div>

        <form class="auth-email-form" data-auth-email-form>
          <label for="authEmailInput">${text.emailLabel}</label>
          <div class="auth-email-row">
            <input id="authEmailInput" type="email" placeholder="${text.emailPlaceholder}" autocomplete="email" ${configured ? "" : "disabled"} required>
            <button type="submit" class="btn btn-primary" ${configured ? "" : "disabled"}>${text.emailButton}</button>
          </div>
        </form>

        <p class="auth-message" data-auth-message aria-live="polite"></p>

        <button type="button" class="btn btn-secondary auth-signout" data-auth-signout hidden>
          ${text.signOut}
        </button>
      </div>
    `;

    setConnectionNotice(modal, configured);
    return modal;
  }

  function renderProviderButton(provider, label, enabled, configured) {
    const disabled = !configured || !enabled;
    const suffix = configured && !enabled ? ` <span>${text.comingSoon}</span>` : "";

    return `
      <button type="button" class="btn btn-light" data-auth-provider="${provider}" ${disabled ? "disabled" : ""}>
        ${label}${suffix}
      </button>
    `;
  }

  function wireAuthActions(modal, config, authState, trigger) {
    modal.querySelectorAll("[data-auth-provider]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!authState.client || button.disabled) return;

        const provider = button.dataset.authProvider;
        const { error } = await authState.client.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: getRedirectUrl(config)
          }
        });

        if (error) showAuthMessage(modal, getAuthErrorMessage(error));
      });
    });

    modal.querySelector("[data-auth-email-form]").addEventListener("submit", async (event) => {
      event.preventDefault();

      const input = modal.querySelector("#authEmailInput");
      const button = modal.querySelector("[data-auth-email-form] button");
      const email = input.value.trim();
      if (!email) return;

      if (!authState.client) {
        showAuthMessage(modal, authState.loading ? text.authLoading : text.error);
        return;
      }

      const originalButtonText = button.textContent;
      button.disabled = true;
      button.textContent = text.sending;
      showAuthMessage(modal, text.sending);

      try {
        const { error } = await withTimeout(
          authState.client.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: getRedirectUrl(config)
            }
          }),
          15000
        );

        showAuthMessage(modal, error ? getAuthErrorMessage(error) : text.checkEmail);
        if (!error) input.value = "";
      } catch (error) {
        showAuthMessage(modal, getAuthErrorMessage(error));
      } finally {
        button.disabled = false;
        button.textContent = originalButtonText;
      }
    });

    modal.querySelector("[data-auth-display-form]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const title = modal.querySelector("[data-auth-display-title]").value.trim();
      const name = modal.querySelector("[data-auth-display-name]").value.trim();
      const profile = { title, name };

      saveTeacherDisplayName(profile);
      updateAuthButton(trigger, authState.session);
      updateSignedInView(modal, authState.session, trigger);

      let saveResult = { error: null };
      try {
        saveResult = await saveTeacherProfile(authState, profile);
      } catch (error) {
        saveResult = { error };
      }
      showAuthMessage(modal, saveResult.error ? text.nameSavedLocal : text.nameSaved);
      notifyAuthSubscribers();
    });

    modal.querySelector("[data-auth-signout]").addEventListener("click", async () => {
      if (!authState.client) return;
      await authState.client.auth.signOut();
      authState.session = null;
      updateAuthButton(trigger, null);
      updateSignedInView(modal, null, trigger);
      notifyAuthSubscribers();
    });
  }

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
    } catch (error) {
      // Supabase may have already processed the URL. getSession still runs next.
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
    authSubscribers.forEach((callback) => callback(context));
    document.dispatchEvent(new CustomEvent("helpingteachers:auth", { detail: context }));
  }

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
    } catch (error) {
      return { error };
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
    } catch (error) {
      return { data: null, error };
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
    } catch (error) {
      return { error };
    }
  }

  function updateAuthButton(trigger, session) {
    if (!session) {
      trigger.textContent = text.signIn;
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

    if (!session) {
      userBox.hidden = true;
      userBox.textContent = "";
      signOutBtn.hidden = true;
      displayForm.hidden = true;
      return;
    }

    hydrateTeacherDisplayForm(modal, session);
    userBox.hidden = false;
    userBox.textContent = `${text.signedIn}: ${getTeacherDisplayName(session)}`;
    signOutBtn.hidden = false;
    displayForm.hidden = false;
    updateAuthButton(trigger, session);
  }

  function getTeacherDisplayName(session) {
    const saved = readTeacherDisplayName();
    if (saved && saved.name) {
      return [saved.title, saved.name].filter(Boolean).join(" ");
    }

    const metadata = session && session.user ? session.user.user_metadata || {} : {};
    const fullName = metadata.full_name || metadata.name;
    if (fullName) return fullName;

    const email = session && session.user ? session.user.email || "" : "";
    const firstEmailPart = email.split("@")[0];
    const guessedName = guessReadableName(firstEmailPart);

    return guessedName || email || text.teacherFallback;
  }

  function guessReadableName(value) {
    if (!value) return "";

    const cleaned = value
      .replace(/[._-]+/g, " ")
      .replace(/\d+/g, " ")
      .trim();

    if (!cleaned) return "";

    return cleaned
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
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
    try {
      return JSON.parse(localStorage.getItem(TEACHER_NAME_KEY)) || {};
    } catch (error) {
      return {};
    }
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

  function showAuthMessage(modal, message) {
    modal.querySelector("[data-auth-message]").textContent = message;
  }

  function getAuthErrorMessage(error) {
    if (!error || !error.message) return text.error;
    if (error.name === "TimeoutError") return text.requestTimeout;
    return `${text.authErrorPrefix} ${error.message}`;
  }

  function withTimeout(promise, timeoutMs) {
    let timeoutId;
    const timeout = new Promise((_resolve, reject) => {
      timeoutId = window.setTimeout(() => {
        const error = new Error("Request timed out");
        error.name = "TimeoutError";
        reject(error);
      }, timeoutMs);
    });

    return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
  }

  function openModal(modal) {
    modal.hidden = false;
    document.body.classList.add("auth-modal-open");
    const firstButton = modal.querySelector("button:not([disabled]), input:not([disabled])");
    if (firstButton) firstButton.focus();
  }

  function closeModal(modal) {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("auth-modal-open");
  }
})();