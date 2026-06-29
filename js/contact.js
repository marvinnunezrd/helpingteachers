document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const isSpanish =
    document.documentElement.lang &&
    document.documentElement.lang.toLowerCase().startsWith("es");

  const text = isSpanish
    ? {
        sending: "Enviando...",
        success: "¡Gracias! Tu mensaje fue enviado. Te responderemos pronto.",
        error: "No se pudo enviar el mensaje. Intenta de nuevo o escríbenos directamente.",
        send: "Enviar mensaje"
      }
    : {
        sending: "Sending...",
        success: "Thank you! Your message was sent. We'll get back to you soon.",
        error: "We couldn't send your message. Please try again or email us directly.",
        send: "Send message"
      };

  const nameInput = document.getElementById("contactName");
  const emailInput = document.getElementById("contactEmail");
  const statusEl = document.getElementById("contactStatus");
  const submitBtn = form.querySelector(".contact-submit");

  // Pre-fill name and email if the teacher is signed in
  function prefillFromAuth() {
    if (!window.HelpingTeachersAuth || !window.HelpingTeachersAuth.isSignedIn()) return;

    const session = window.HelpingTeachersAuth.getSession();
    const email = session && session.user ? session.user.email || "" : "";
    if (email && !emailInput.value) emailInput.value = email;

    const displayName = window.HelpingTeachersAuth.getDisplayName();
    if (displayName && !nameInput.value) nameInput.value = displayName;
  }

  if (window.HelpingTeachersAuth && typeof window.HelpingTeachersAuth.onReady === "function") {
    window.HelpingTeachersAuth.onReady(prefillFromAuth);
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    statusEl.textContent = text.sending;
    statusEl.className = "contact-status";
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = text.sending;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (response.ok) {
        form.reset();
        statusEl.textContent = text.success;
        statusEl.classList.add("contact-status-success");
      } else {
        statusEl.textContent = text.error;
        statusEl.classList.add("contact-status-error");
      }
    } catch (err) {
      statusEl.textContent = text.error;
      statusEl.classList.add("contact-status-error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel || text.send;
    }
  });
});
