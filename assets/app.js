(function () {
  const burger = document.getElementById("burger");
  const mobile = document.getElementById("mobileMenu");

  if (burger && mobile) {
    burger.addEventListener("click", () => {
      mobile.classList.toggle("show");
      burger.setAttribute("aria-expanded", mobile.classList.contains("show") ? "true" : "false");
    });
  }

  // Highlight active link based on current page
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll('a[data-nav]').forEach(a=>{
    if ((a.getAttribute("href") || "").toLowerCase() === path) a.classList.add("active");
    if (path === "" && (a.getAttribute("href")||"").toLowerCase() === "index.html") a.classList.add("active");
  });

  // Register form -> WhatsApp prefilled
  const form = document.getElementById("registerForm");
  const success = document.getElementById("successMsg");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = form.querySelector('[name="name"]').value.trim();
      const parent = form.querySelector('[name="parent"]').value.trim();
      const grade = form.querySelector('[name="grade"]').value;
      const subject = form.querySelector('[name="subject"]').value;
      const notes = form.querySelector('[name="notes"]').value.trim();

      const msg =
`السلام عليكم،
أنا ${name} — الصف: ${grade}
عايز أسجل في: ${subject}
رقم ولي الأمر: ${parent}
ملاحظات: ${notes || "لا يوجد"}`;

      const wa = "https://wa.me/201006693681?text=" + encodeURIComponent(msg);

      if (success) success.classList.add("show");
      // فتح واتساب بعد الإرسال
      window.open(wa, "_blank");
      form.reset();
    });
  }
})();
