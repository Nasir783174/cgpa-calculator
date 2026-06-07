function closeMobileMenu() {
  var m = document.getElementById("mobileMenu");
  var h = document.getElementById("hamburger");
  if (m) m.classList.remove("open");
  if (h) h.classList.remove("active");
}

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const hamburger  = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobileMenu");
    if (hamburger && mobileMenu) {
      hamburger.addEventListener("click", function () {
        this.classList.toggle("active");
        mobileMenu.classList.toggle("open");
      });
      document.querySelectorAll(".mobile-nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          hamburger.classList.remove("active");
          mobileMenu.classList.remove("open");
        });
      });
    }

    // Nav dropdown hover — with delay so mouse can travel into menu
    const navDropTrigger = document.getElementById("navDropTrigger");
    const navDropMenu    = document.getElementById("navDropMenu");
    if (navDropTrigger && navDropMenu) {
      let closeTimer = null;

      function openMenu() {
        if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
        navDropMenu.classList.add("open");
      }

      function scheduleClose() {
        closeTimer = setTimeout(function() {
          navDropMenu.classList.remove("open");
        }, 120);
      }

      navDropTrigger.addEventListener("mouseenter", openMenu);
      navDropTrigger.addEventListener("mouseleave", scheduleClose);
      navDropMenu.addEventListener("mouseenter",   openMenu);
      navDropMenu.addEventListener("mouseleave",   scheduleClose);
    }

    // FAQ accordion (blog/info pages)
    document.querySelectorAll(".faq-question").forEach((question) => {
      question.addEventListener("click", function () {
        const isOpen = this.getAttribute("aria-expanded") === "true";
        document.querySelectorAll(".faq-question").forEach((q) => { q.setAttribute("aria-expanded","false"); q.nextElementSibling.classList.remove("open"); });
        if (!isOpen) { this.setAttribute("aria-expanded","true"); this.nextElementSibling.classList.add("open"); }
      });
    });
  });
})();
