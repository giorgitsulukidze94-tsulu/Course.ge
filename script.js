const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyYmZJSbjPPn13Ks30mjg0rXlndSt0VqCmYpWUizfMQF_1s0rNZxxZw-TzqcHfRsUg_JQ/exec";

const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");
const revealElements = document.querySelectorAll(".reveal");
const faqItems = document.querySelectorAll(".faq-item");
const gotoButtons = document.querySelectorAll(".goto-btn");
const applicationForm = document.getElementById("applicationForm");
const formNote = document.getElementById("formNote");

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("show");
  });

  document.querySelectorAll(".menu a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("show");
    });
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
  { threshold: 0.14 }
);

revealElements.forEach((el) => observer.observe(el));

faqItems.forEach((item) => {
  const button = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  button.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    faqItems.forEach((otherItem) => {
      otherItem.classList.remove("active");
      otherItem.querySelector(".faq-answer").style.maxHeight = null;
    });

    if (!isActive) {
      item.classList.add("active");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

gotoButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-target");
    const target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

if (applicationForm) {
  applicationForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(applicationForm);

    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      topic: formData.get("topic"),
      message: formData.get("message")
    };

    if (formNote) {
      formNote.textContent = "იგზავნება...";
    }

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (formNote) {
        formNote.textContent = "განაცხადი წარმატებით გაიგზავნა.";
      }

      applicationForm.reset();
    } catch (error) {
      if (formNote) {
        formNote.textContent = "შეცდომა დაფიქსირდა. სცადეთ თავიდან.";
      }
    }
  });
}
