const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");
const form = document.getElementById("registrationForm");
const formMessage = document.getElementById("formMessage");
const revealElements = document.querySelectorAll(".reveal");

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("show");
  });

  document.querySelectorAll(".menu a").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("show");
    });
  });
}

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get("name");

    formMessage.textContent = `${name}, თქვენი განაცხადი მიღებულია. შემდეგ ეტაპზე ამ ფორმას რეალურად დავუკავშირებთ ელფოსტას ან Google Sheets-ს.`;

    form.reset();
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.15,
  }
);

revealElements.forEach((element) => {
  observer.observe(element);
});
