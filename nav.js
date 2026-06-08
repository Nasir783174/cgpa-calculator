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
    // Nav dropdown hover
    const navDropTrigger = document.getElementById("navDropTrigger");
    const navDropMenu    = document.getElementById("navDropMenu");
    if (navDropTrigger && navDropMenu) {
      navDropTrigger.addEventListener("mouseenter", () => navDropMenu.classList.add("open"));
      navDropTrigger.addEventListener("mouseleave", () => navDropMenu.classList.remove("open"));
      navDropMenu.addEventListener("mouseenter",   () => navDropMenu.classList.add("open"));
      navDropMenu.addEventListener("mouseleave",   () => navDropMenu.classList.remove("open"));
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
