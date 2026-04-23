const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");
const form = document.getElementById("registrationForm");
const formMessage = document.getElementById("formMessage");

menuToggle.addEventListener("click", () => {
  menu.classList.toggle("show");
});

document.querySelectorAll(".menu a").forEach(link => {
  link.addEventListener("click", () => {
    menu.classList.remove("show");
  });
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(form);
  const name = formData.get("name");

  formMessage.textContent = `${name}, თქვენი განაცხადი მიღებულია. შემდეგ ეტაპზე ამ ფორმას რეალურად დავუკავშირებთ ელფოსტას ან Google Sheets-ს.`;

  form.reset();
});
