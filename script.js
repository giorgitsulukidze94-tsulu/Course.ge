const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyYmZJSbjPPn13Ks30mjg0rXlndSt0VqCmYpWUizfMQF_1s0rNZxxZw-TzqcHfRsUg_JQ/exec";

// ================= MENU =================
const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("show");
  });
}

// ================= SCROLL ANIMATION =================
const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
});

revealElements.forEach((el) => observer.observe(el));

// ================= FORM =================
const form = document.getElementById("applicationForm");
const formNote = document.getElementById("formNote");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    const payload = {
      name: data.get("name"),
      phone: data.get("phone"),
      email: data.get("email"),
      topic: data.get("topic"),
      message: data.get("message"),
    };

    formNote.textContent = "იგზავნება...";

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(payload),
      });

      formNote.textContent = "წარმატებით გაიგზავნა ✅";
      form.reset();
    } catch {
      formNote.textContent = "შეცდომა ❌";
    }
  });
}

// ================= VIDEO SYSTEM =================
let allVideos = [];
let videoIndex = 0;
let showAllVideos = false;

async function loadVideos() {
  const container = document.getElementById("videosContainer");
  if (!container) return;

  const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=videos`);
  allVideos = await res.json();

  renderVideos();
}

function renderVideos() {
  const container = document.getElementById("videosContainer");
  container.innerHTML = "";

  let videosToShow = showAllVideos
    ? allVideos
    : allVideos.slice(videoIndex, videoIndex + 7);

  videosToShow.forEach((v) => {
    const embed = convertYouTube(v["YouTube Link"]);

    container.innerHTML += `
      <div class="video-card">
        <div class="video-thumb">
          <iframe src="${embed}" frameborder="0" allowfullscreen></iframe>
        </div>
        <h3>${v["სათაური"]}</h3>
        <p>${v["აღწერა"]}</p>
      </div>
    `;
  });
}

// arrows
function nextVideos() {
  if (videoIndex + 7 < allVideos.length) {
    videoIndex += 7;
    renderVideos();
  }
}

function prevVideos() {
  if (videoIndex - 7 >= 0) {
    videoIndex -= 7;
    renderVideos();
  }
}

// toggle
function toggleVideos() {
  showAllVideos = !showAllVideos;
  renderVideos();
}

// ================= SYLLABUS =================
let allSyllabus = [];
let showAllSyllabus = false;

async function loadSyllabus() {
  const container = document.getElementById("syllabusContainer");
  if (!container) return;

  const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=syllabus`);
  allSyllabus = await res.json();

  renderSyllabus();
}

function renderSyllabus() {
  const container = document.getElementById("syllabusContainer");
  container.innerHTML = "";

  let items = showAllSyllabus
    ? allSyllabus
    : allSyllabus.slice(0, 5);

  items.forEach((s) => {
    container.innerHTML += `<li>✦ ${s["თემა"]}</li>`;
  });
}

function toggleSyllabus() {
  showAllSyllabus = !showAllSyllabus;
  renderSyllabus();
}

// ================= HELPERS =================
function convertYouTube(link) {
  if (!link) return "";

  if (link.includes("watch?v=")) {
    return link.replace("watch?v=", "embed/");
  }

  if (link.includes("youtu.be")) {
    return "https://www.youtube.com/embed/" + link.split("/").pop();
  }

  return link;
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  loadVideos();
  loadSyllabus();
});
