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

    // Nav dropdown click toggle
    const navDropTrigger = document.getElementById("navDropTrigger");
    const navDropMenu    = document.getElementById("navDropMenu");
    if (navDropTrigger && navDropMenu) {
      navDropTrigger.addEventListener("click", function (e) {
        e.stopPropagation();
        navDropMenu.classList.toggle("open");
      });

      // Close when clicking outside
      document.addEventListener("click", function () {
        navDropMenu.classList.remove("open");
      });

      // Prevent clicks inside the menu from closing it
      navDropMenu.addEventListener("click", function (e) {
        e.stopPropagation();
      });
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
