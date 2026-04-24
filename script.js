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

async function loadVideos() {
  const container = document.getElementById("videosContainer");

  if (!container) return;

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=videos`);
    const videos = await response.json();

    container.innerHTML = "";

    videos.forEach((video) => {
      if (String(video["აქტიური"]).toUpperCase() !== "YES") return;

      const title = video["სათაური"] || "";
      const description = video["აღწერა"] || "";
      const link = video["YouTube Link"] || "";

      const embedLink = convertYouTubeLink(link);

      container.innerHTML += `
        <article class="video-card reveal visible">
          <div class="video-thumb">
            ${
              embedLink
                ? `<iframe width="100%" height="100%" src="${embedLink}" frameborder="0" allowfullscreen></iframe>`
                : `<div class="play-circle">▶</div>`
            }
          </div>
          <h3>${title}</h3>
          <p>${description}</p>
        </article>
      `;
    });

    if (container.innerHTML.trim() === "") {
      container.innerHTML = `
        <article class="video-card reveal visible">
          <div class="video-thumb">
            <div class="play-circle">▶</div>
          </div>
          <h3>ვიდეოები მზადდება</h3>
          <p>ვიდეო გაკვეთილები მალე დაემატება.</p>
        </article>
      `;
    }
  } catch (error) {
    console.error("Videos loading error:", error);
  }
}

async function loadSyllabus() {
  const container = document.getElementById("syllabusContainer");

  if (!container) return;

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=syllabus`);
    const syllabus = await response.json();

    container.innerHTML = "";

    syllabus.forEach((item) => {
      if (String(item["აქტიური"]).toUpperCase() !== "YES") return;

      const title = item["თემა"] || "";
      const description = item["აღწერა"] || "";

      container.innerHTML += `
        <li><span>✦</span> ${title} — ${description}</li>
      `;
    });
  } catch (error) {
    console.error("Syllabus loading error:", error);
  }
}

async function loadServices() {
  const container = document.getElementById("servicesContainer");

  if (!container) return;

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=services`);
    const services = await response.json();

    container.innerHTML = "";

    services.forEach((service) => {
      if (String(service["აქტიური"]).toUpperCase() !== "YES") return;

      const title = service["სერვისი"] || "";
      const description = service["აღწერა"] || "";
      const buttonText = service["ღილაკის ტექსტი"] || "დეტალურად";

      container.innerHTML += `
        <article class="course-card reveal visible">
          <div class="course-glow cyan"></div>
          <div class="course-icon chart-icon">⌘</div>
          <h3>${title}</h3>
          <p>${description}</p>
          <button class="triangle-btn goto-btn" data-target="application" aria-label="${buttonText}">
            <span></span>
          </button>
        </article>
      `;
    });
  } catch (error) {
    console.error("Services loading error:", error);
  }
}

function convertYouTubeLink(link) {
  if (!link) return "";

  if (link.includes("youtube.com/watch?v=")) {
    return link.replace("watch?v=", "embed/");
  }

  if (link.includes("youtu.be/")) {
    const videoId = link.split("youtu.be/")[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  if (link.includes("youtube.com/embed/")) {
    return link;
  }

  return "";
}

document.addEventListener("DOMContentLoaded", () => {
  loadVideos();
  loadSyllabus();
  loadServices();
});
