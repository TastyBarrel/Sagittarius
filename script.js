// Sagittarius Consulting — shared behavior

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

  // Contact form — Web3Forms, following their documented AJAX/JSON pattern
  const form = document.querySelector("#contact-form");
  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const note = document.querySelector("#form-status");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (note) {
        note.textContent = "";
        note.classList.remove("form-note--error");
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.6";
      }

      const formData = new FormData(form);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: json,
        });
        const result = await response.json();

        if (response.status === 200 && result.success) {
          form.reset();
          form.style.display = "none";
          if (note) {
            note.textContent =
              "Thanks, that's been sent. We'll get back to you soon.";
          }
        } else {
          throw new Error(result.message || "Form submission failed");
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
