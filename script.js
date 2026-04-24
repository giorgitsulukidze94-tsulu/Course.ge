const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyYmZJSbjPPn13Ks30mjg0rXlndSt0VqCmYpWUizfMQF_1s0rNZxxZw-TzqcHfRsUg_JQ/exec";

const VIDEOS_INITIAL = 7;
const VIDEOS_PAGE_SIZE = 10;
const SYLLABUS_INITIAL = 5;
const SYLLABUS_PAGE_SIZE = 10;

const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");
const applicationForm = document.getElementById("applicationForm");
const formNote = document.getElementById("formNote");
const newsletterForm = document.getElementById("newsletterForm");
const newsletterNote = document.getElementById("newsletterNote");
const toastEl = document.getElementById("toast");

let allVideos = [];
let videosShown = VIDEOS_INITIAL;

let allSyllabus = [];
let syllabusShown = SYLLABUS_INITIAL;

/* ---------- Mobile menu ---------- */
if (menuToggle && menu) {
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("show");
  });

  document.querySelectorAll(".menu a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("show");
    });
  });

  // გარე კლიკზე დახურვა
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
      menu.classList.remove("show");
    }
  });
}

/* ---------- Reveal on scroll ---------- */
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

/* ---------- FAQ ---------- */
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

/* ---------- Goto buttons ---------- */
function initGotoButtons() {
  document.querySelectorAll(".goto-btn").forEach((button) => {
    if (button.dataset.bound === "1") return;
    button.dataset.bound = "1";

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

/* ---------- Toast ---------- */
function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 3200);
}

/* ---------- Application form ---------- */
if (applicationForm) {
  applicationForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(applicationForm);

    const payload = {
      type: "application",
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

      if (formNote) formNote.textContent = "მოთხოვნა მიღებულია. მალე დაგიკავშირდებით.";
      applicationForm.reset();
      showToast("განაცხადი გაგზავნილია ✓");
    } catch (error) {
      if (formNote) formNote.textContent = "შეცდომა დაფიქსირდა. სცადეთ თავიდან.";
      showToast("გაგზავნა ვერ მოხერხდა");
    }
  });
}

/* ---------- Newsletter form ---------- */
if (newsletterForm) {
  newsletterForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = newsletterForm.querySelector("input[type='email']");
    if (!emailInput || !emailInput.value.trim()) return;

    const email = emailInput.value.trim();

    if (newsletterNote) newsletterNote.textContent = "იგზავნება...";

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ type: "newsletter", email })
      });

      emailInput.value = "";
      if (newsletterNote) newsletterNote.textContent = "გმადლობთ, დაემატე სიაში ✓";
      showToast("გმადლობთ გამოწერისთვის ✓");
    } catch (error) {
      if (newsletterNote) newsletterNote.textContent = "ვერ გაიგზავნა. სცადეთ ხელახლა.";
    }
  });
}

/* ---------- Videos ---------- */
async function loadVideos() {
  const container = document.getElementById("videosContainer");
  if (!container) return;

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=videos`);
    const data = await response.json();

    allVideos = (Array.isArray(data) ? data : []).filter((video) => {
      return String(video["აქტიური"]).trim().toUpperCase() === "YES";
    });

    videosShown = Math.min(VIDEOS_INITIAL, allVideos.length);
    renderVideos();
    updateVideosMoreBtn();
    updateCarouselArrows();
  } catch (error) {
    console.error("Videos loading error:", error);
  }
}

function renderVideos() {
  const container = document.getElementById("videosContainer");
  if (!container) return;

  const visibleVideos = allVideos.slice(0, videosShown);

  container.innerHTML = visibleVideos.map((video) => {
    const title = video["სათაური"] || "";
    const description = video["აღწერა"] || "";
    const link = video["YouTube Link"] || "";
    const embedLink = convertYouTubeLink(link);

    const thumb = embedLink
      ? `<iframe src="${embedLink}" frameborder="0" allowfullscreen loading="lazy"></iframe>`
      : `<div class="play-circle">▶</div>`;

    return `
      <article class="video-card reveal visible">
        <div class="video-thumb">${thumb}</div>
        <h3>${title}</h3>
        <p>${description}</p>
      </article>
    `;
  }).join("");

  updateCarouselArrows();
}

function updateVideosMoreBtn() {
  const btn = document.getElementById("showMoreVideos");
  if (!btn) return;

  if (allVideos.length <= VIDEOS_INITIAL) {
    btn.style.display = "none";
    return;
  }

  btn.style.display = "inline-flex";

  if (videosShown >= allVideos.length) {
    btn.textContent = "ნაკლების ჩვენება";
  } else {
    const remaining = allVideos.length - videosShown;
    const nextBatch = Math.min(VIDEOS_PAGE_SIZE, remaining);
    btn.textContent = `მეტის ჩვენება (+${nextBatch})`;
  }
}

const showMoreVideosBtn = document.getElementById("showMoreVideos");
if (showMoreVideosBtn) {
  showMoreVideosBtn.addEventListener("click", () => {
    if (videosShown >= allVideos.length) {
      // collapse
      videosShown = VIDEOS_INITIAL;
      renderVideos();
      updateVideosMoreBtn();
      const videosSection = document.getElementById("videos");
      if (videosSection) videosSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const container = document.getElementById("videosContainer");
    const prevScroll = container ? container.scrollLeft : 0;

    videosShown = Math.min(videosShown + VIDEOS_PAGE_SIZE, allVideos.length);
    renderVideos();
    updateVideosMoreBtn();

    // ვიტოვებთ იგივე scroll პოზიციას, რომ 5-6-7 არ დაიკარგოს
    if (container) {
      container.scrollLeft = prevScroll;
    }
  });
}

/* ---------- Syllabus ---------- */
async function loadSyllabus() {
  const container = document.getElementById("syllabusContainer");
  if (!container) return;

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=syllabus`);
    const data = await response.json();

    allSyllabus = (Array.isArray(data) ? data : []).filter((item) => {
      return String(item["აქტიური"]).trim().toUpperCase() === "YES";
    });

    if (!allSyllabus.length) {
      // Google Sheet-ში მონაცემი ცარიელია — ვტოვებთ default ლისტს HTML-დან
      updateSyllabusMoreBtn();
      return;
    }

    syllabusShown = Math.min(SYLLABUS_INITIAL, allSyllabus.length);
    renderSyllabus();
    updateSyllabusMoreBtn();
  } catch (error) {
    console.error("Syllabus loading error:", error);
  }
}

function renderSyllabus() {
  const container = document.getElementById("syllabusContainer");
  if (!container) return;

  const visibleSyllabus = allSyllabus.slice(0, syllabusShown);

  container.innerHTML = visibleSyllabus.map((item) => {
    const title = item["თემა"] || "";
    const description = item["აღწერა"] || "";

    return `
      <li>
        <span>✦</span>
        <div>
          <strong>${title}</strong>
          ${description ? `<p>${description}</p>` : ""}
        </div>
      </li>
    `;
  }).join("");
}

function updateSyllabusMoreBtn() {
  const btn = document.getElementById("showMoreSyllabus");
  if (!btn) return;

  if (!allSyllabus.length || allSyllabus.length <= SYLLABUS_INITIAL) {
    btn.style.display = "none";
    return;
  }

  btn.style.display = "inline-flex";

  if (syllabusShown >= allSyllabus.length) {
    btn.textContent = "ნაკლების ჩვენება";
  } else {
    const remaining = allSyllabus.length - syllabusShown;
    const nextBatch = Math.min(SYLLABUS_PAGE_SIZE, remaining);
    btn.textContent = `მეტის ჩვენება (+${nextBatch})`;
  }
}

const showMoreSyllabusBtn = document.getElementById("showMoreSyllabus");
if (showMoreSyllabusBtn) {
  showMoreSyllabusBtn.addEventListener("click", () => {
    if (!allSyllabus.length) return;

    if (syllabusShown >= allSyllabus.length) {
      syllabusShown = SYLLABUS_INITIAL;
      renderSyllabus();
      updateSyllabusMoreBtn();
      const syllabusSection = document.getElementById("syllabus");
      if (syllabusSection) syllabusSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    syllabusShown = Math.min(syllabusShown + SYLLABUS_PAGE_SIZE, allSyllabus.length);
    renderSyllabus();
    updateSyllabusMoreBtn();
  });
}

/* ---------- Services ---------- */
async function loadServices() {
  const container = document.getElementById("servicesContainer");
  if (!container) return;

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=services`);
    const services = await response.json();

    const activeServices = (Array.isArray(services) ? services : []).filter((service) => {
      return String(service["აქტიური"]).trim().toUpperCase() === "YES";
    });

    if (!activeServices.length) return;

    container.innerHTML = activeServices.map((service) => {
      const title = service["სერვისი"] || "";
      const description = service["აღწერა"] || "";
      const buttonText = service["ღილაკის ტექსტი"] || "დეტალურად";

      return `
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
    }).join("");

    initGotoButtons();
  } catch (error) {
    console.error("Services loading error:", error);
  }
}

/* ---------- Helpers ---------- */
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

/* ---------- Carousel arrows ---------- */
const videoPrev = document.getElementById("videoPrev");
const videoNext = document.getElementById("videoNext");
const videosContainer = document.getElementById("videosContainer");

function getScrollStep() {
  if (!videosContainer) return 560;
  const firstCard = videosContainer.querySelector(".video-card");
  if (!firstCard) return 560;
  const style = window.getComputedStyle(videosContainer);
  const gap = parseInt(style.gap || style.columnGap || "18", 10) || 18;
  return (firstCard.offsetWidth + gap) * 2; // 2 ვიდეო ერთი კლიკით
}

function updateCarouselArrows() {
  if (!videosContainer || !videoPrev || !videoNext) return;

  const maxScroll = videosContainer.scrollWidth - videosContainer.clientWidth;
  const atStart = videosContainer.scrollLeft <= 2;
  const atEnd = videosContainer.scrollLeft >= maxScroll - 2;

  videoPrev.disabled = atStart;
  videoNext.disabled = atEnd || maxScroll <= 0;
}

if (videoPrev && videosContainer) {
  videoPrev.addEventListener("click", () => {
    videosContainer.scrollBy({
      left: -getScrollStep(),
      behavior: "smooth"
    });
  });
}

if (videoNext && videosContainer) {
  videoNext.addEventListener("click", () => {
    videosContainer.scrollBy({
      left: getScrollStep(),
      behavior: "smooth"
    });
  });
}

if (videosContainer) {
  videosContainer.addEventListener("scroll", () => {
    // throttled via rAF
    if (videosContainer._scrollRaf) return;
    videosContainer._scrollRaf = requestAnimationFrame(() => {
      updateCarouselArrows();
      videosContainer._scrollRaf = null;
    });
  });

  window.addEventListener("resize", updateCarouselArrows);
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initReveal();
  initFAQ();
  initGotoButtons();
  loadVideos();
  loadSyllabus();
  loadServices();
  updateCarouselArrows();
});
