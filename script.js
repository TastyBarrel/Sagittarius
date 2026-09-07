// Sagittarius Consulting — shared behavior

const pageLoadedAt = Date.now();

document.addEventListener("DOMContentLoaded", () => {
  // Mobile nav toggle
  const toggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".nav-links--mobile");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    mobileNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  // Reveal diagrams once, when scrolled into view
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const revealTargets = document.querySelectorAll(".diagram, .reveal-block");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealTargets.forEach((d) => d.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    revealTargets.forEach((d) => io.observe(d));
  }

  // Set reveal-path lengths dynamically so dash animation matches actual path length
  document.querySelectorAll(".reveal-path").forEach((path) => {
    try {
      const len = path.getTotalLength();
      path.style.setProperty("--len", len);
    } catch (e) {
      /* non-path element, ignore */
    }
  });

  // Contact form — submits to Formspree via fetch so the page never leaves
  const form = document.querySelector("#contact-form");
  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const note = document.querySelector("#form-status");
    const submitLabel = submitBtn ? submitBtn.innerHTML : "";

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (note) {
        note.textContent = "";
        note.classList.remove("form-note--error");
      }

      // --- Spam checks: honeypot fields + minimum time-on-page ---
      // Real visitors don't fill in fields they can't see, and can't fill out
      // a five-field form in under 3 seconds. Bots regularly do both. We don't
      // tell the "submitter" anything failed — silently drop it and show the
      // normal success state, so scripted spam gets no signal to adapt to.
      const gotcha = form.querySelector('[name="_gotcha"]');
      const decoy = form.querySelector('[name="phone"]');
      const tooFast = Date.now() - pageLoadedAt < 3000;
      const honeypotTripped = (gotcha && gotcha.value) || (decoy && decoy.value);

      if (honeypotTripped || tooFast) {
        form.reset();
        form.style.display = "none";
        if (note) {
          note.textContent =
            "Thanks — that's been sent. We'll get back to you soon.";
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.6";
      }

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          form.reset();
          form.style.display = "none";
          if (note) {
            note.textContent =
              "Thanks — that's been sent. We'll get back to you soon.";
          }
        } else {
          throw new Error("Form submission failed");
        }
      } catch (err) {
        if (note) {
          note.textContent =
            "Something went wrong sending that. Please try again, or email us directly.";
          note.classList.add("form-note--error");
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = "";
        }
      }
    });
  }
});
