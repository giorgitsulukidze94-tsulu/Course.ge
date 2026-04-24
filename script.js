const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyYmZJSbjPPn13Ks30mjg0rXlndSt0VqCmYpWUizfMQF_1s0rNZxxZw-TzqcHfRsUg_JQ/exec";

const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");
const applicationForm = document.getElementById("applicationForm");
const formNote = document.getElementById("formNote");

let allVideos = [];
let videosExpanded = false;

let allSyllabus = [];
let syllabusExpanded = false;

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

function initReveal() {
  const revealElements = document.querySelectorAll(".reveal");

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
}

function initFAQ() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (!button || !answer) return;

    button.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      faqItems.forEach((otherItem) => {
        otherItem.classList.remove("active");
        const otherAnswer = otherItem.querySelector(".faq-answer");
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add("active");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
}

function initGotoButtons() {
  document.querySelectorAll(".goto-btn").forEach((button) => {
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
}

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

    if (formNote) formNote.textContent = "იგზავნება...";

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(payload)
      });

      if (formNote) formNote.textContent = "განაცხადი წარმატებით გაიგზავნა.";
      applicationForm.reset();
    } catch (error) {
      if (formNote) formNote.textContent = "შეცდომა დაფიქსირდა. სცადეთ თავიდან.";
    }
  });
}

async function loadVideos() {
  const container = document.getElementById("videosContainer");
  const moreBtn = document.getElementById("showMoreVideos");

  if (!container) return;

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=videos`);
    const data = await response.json();

    allVideos = data.filter((video) => {
      return String(video["აქტიური"]).trim().toUpperCase() === "YES";
    });

    renderVideos();

    if (moreBtn) {
      moreBtn.style.display = allVideos.length > 7 ? "inline-flex" : "none";
      moreBtn.onclick = () => {
        videosExpanded = !videosExpanded;
        renderVideos();
        moreBtn.textContent = videosExpanded ? "ნაკლების ჩვენება" : "მეტის ჩვენება";
      };
    }
  } catch (error) {
    console.error("Videos loading error:", error);
  }
}

function renderVideos() {
  const container = document.getElementById("videosContainer");
  if (!container) return;

  const visibleVideos = videosExpanded ? allVideos : allVideos.slice(0, 7);

  container.innerHTML = "";

  visibleVideos.forEach((video) => {
    const title = video["სათაური"] || "";
    const description = video["აღწერა"] || "";
    const link = video["YouTube Link"] || "";
    const embedLink = convertYouTubeLink(link);

    container.innerHTML += `
      <article class="video-card reveal visible">
        <div class="video-thumb">
          ${
            embedLink
              ? `<iframe src="${embedLink}" frameborder="0" allowfullscreen></iframe>`
              : `<div class="play-circle">▶</div>`
          }
        </div>
        <h3>${title}</h3>
        <p>${description}</p>
      </article>
    `;
  });
}

async function loadSyllabus() {
  const container = document.getElementById("syllabusContainer");
  const moreBtn = document.getElementById("showMoreSyllabus");

  if (!container) return;

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=syllabus`);
    const data = await response.json();

    allSyllabus = data.filter((item) => {
      return String(item["აქტიური"]).trim().toUpperCase() === "YES";
    });

    renderSyllabus();

    if (moreBtn) {
      moreBtn.style.display = allSyllabus.length > 5 ? "inline-flex" : "none";
      moreBtn.onclick = () => {
        syllabusExpanded = !syllabusExpanded;
        renderSyllabus();
        moreBtn.textContent = syllabusExpanded ? "ნაკლების ჩვენება" : "მეტის ჩვენება";
      };
    }
  } catch (error) {
    console.error("Syllabus loading error:", error);
  }
}

function renderSyllabus() {
  const container = document.getElementById("syllabusContainer");
  if (!container) return;

  const visibleSyllabus = syllabusExpanded ? allSyllabus : allSyllabus.slice(0, 5);

  container.innerHTML = "";

  visibleSyllabus.forEach((item) => {
    const title = item["თემა"] || "";
    const description = item["აღწერა"] || "";

    container.innerHTML += `
      <li>
        <span>✦</span>
        <div>
          <strong>${title}</strong>
          ${description ? `<p>${description}</p>` : ""}
        </div>
      </li>
    `;
  });
}

async function loadServices() {
  const container = document.getElementById("servicesContainer");
  if (!container) return;

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=services`);
    const services = await response.json();

    const activeServices = services.filter((service) => {
      return String(service["აქტიური"]).trim().toUpperCase() === "YES";
    });

    if (!activeServices.length) return;

    container.innerHTML = "";

    activeServices.forEach((service) => {
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

    initGotoButtons();
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
    const videoId = link.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  if (link.includes("youtube.com/embed/")) {
    return link;
  }

  return "";
}

const videoPrev = document.getElementById("videoPrev");
const videoNext = document.getElementById("videoNext");

if (videoPrev) {
  videoPrev.addEventListener("click", () => {
    const container = document.getElementById("videosContainer");
    if (container) {
      container.scrollBy({
        left: -560,
        behavior: "smooth"
      });
    }
  });
}

if (videoNext) {
  videoNext.addEventListener("click", () => {
    const container = document.getElementById("videosContainer");
    if (container) {
      container.scrollBy({
        left: 560,
        behavior: "smooth"
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initReveal();
  initFAQ();
  initGotoButtons();
  loadVideos();
  loadSyllabus();
  loadServices();
});
