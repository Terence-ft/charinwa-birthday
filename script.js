const WHATSAPP_NUMBER = "";
const ONLY_GIFT = "Baby powder";
const BIRTHDAY = new Date(2026, 9, 15);
const WALL_KEY = "charinwa-birthday-wishes";

const wishForm = document.querySelector("#wish-form");
const wishInput = document.querySelector("#birthday-wish");
const nameInput = document.querySelector("#guest-name");
const wishError = document.querySelector("#wish-error");
const wishWall = document.querySelector("#wish-wall");
const giftForm = document.querySelector("#gift-form");
const giftMessage = document.querySelector("#gift-message");
const giftButton = document.querySelector("#gift-submit");
const lightbox = document.querySelector("#lightbox");
const lightboxArt = document.querySelector("#lightbox-art");
const lightboxCaption = document.querySelector("#lightbox-caption");
const canvas = document.querySelector("#confetti");
const ctx = canvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const colors = ["#F59E0B", "#FF4D6D", "#60A5FA", "#F8FAFC"];
let pieces = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function burst(count) {
  if (reducedMotion) return;
  for (let i = 0; i < count; i += 1) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: count > 40 ? -10 : Math.random() * canvas.height,
      r: 3 + Math.random() * 4,
      vy: 1 + Math.random() * (count > 40 ? 3 : 1.4),
      vx: -1 + Math.random() * 2,
      color: colors[i % colors.length],
      life: count > 40 ? 140 : 500,
    });
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces = pieces.filter((piece) => piece.life > 0);
  pieces.forEach((piece) => {
    piece.y += piece.vy;
    piece.x += piece.vx;
    piece.life -= 1;
    if (piece.y > canvas.height) piece.y = -8;
    ctx.fillStyle = piece.color;
    ctx.fillRect(piece.x, piece.y, piece.r, piece.r * 0.6);
  });
  if (!reducedMotion) requestAnimationFrame(drawConfetti);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function tickClock() {
  const now = new Date();
  const target = BIRTHDAY.getTime();
  const sameDay = now.getFullYear() === 2026 && now.getMonth() === 9 && now.getDate() === 15;
  let diff = target - now.getTime();
  const label = document.querySelector("#timer-label");

  if (sameDay) {
    diff = now.getTime() - new Date(2026, 9, 15).getTime();
    label.textContent = "Celebrating 15/10/2026";
  } else if (diff < 0) {
    label.textContent = "Celebrated on 15/10/2026";
    diff = now.getTime() - target;
  } else {
    label.textContent = "Until 15/10/2026";
  }

  const total = Math.max(0, Math.floor(diff / 1000));
  document.querySelector("#t-days").textContent = pad(Math.floor(total / 86400));
  document.querySelector("#t-hours").textContent = pad(Math.floor((total % 86400) / 3600));
  document.querySelector("#t-mins").textContent = pad(Math.floor((total % 3600) / 60));
  document.querySelector("#t-secs").textContent = pad(total % 60);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function loadWishes() {
  try {
    const saved = JSON.parse(localStorage.getItem(WALL_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function renderWall(wishes) {
  const starter = {
    name: "A note",
    wish: "Charinwa, your smile and your radiant eyes make this day brighter. I am proud of you.",
    emoji: "💖",
  };
  const all = [starter, ...wishes];
  wishWall.innerHTML = all
    .map(
      (item) => `
        <article class="note">
          <strong>${escapeHtml(item.name || "Friend")}</strong>
          <p>${escapeHtml(item.emoji || "")} ${escapeHtml(item.wish)}</p>
        </article>`
    )
    .join("");
}

function openWhatsApp(text) {
  const number = WHATSAPP_NUMBER.replace(/\D/g, "");
  const base = number ? `https://wa.me/${number}` : "https://wa.me/";
  window.open(`${base}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
}

document.querySelectorAll(".riddle button").forEach((button) => {
  button.addEventListener("click", () => {
    const answer = button.nextElementSibling;
    const open = answer.hidden;
    answer.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "Hide answer" : "Show answer";
  });
});

document.querySelectorAll("[data-emoji]").forEach((button) => {
  button.addEventListener("click", () => {
    wishInput.value = `${wishInput.value}${button.dataset.emoji}`;
    wishInput.focus();
  });
});

wishForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const wish = wishInput.value.trim();
  const name = nameInput.value.trim() || "Charinwa";
  if (!wish) {
    wishError.hidden = false;
    wishInput.focus();
    return;
  }
  wishError.hidden = true;
  const wishes = loadWishes();
  wishes.unshift({ name, wish });
  localStorage.setItem(WALL_KEY, JSON.stringify(wishes));
  renderWall(wishes);
  burst(90);
  wishForm.reset();
  openWhatsApp(`Happy birthday note for Charinwa, 15/10/2026, from ${name}:\n${wish}`);
});

giftForm.addEventListener("change", (event) => {
  const input = event.target.closest("input[name='gift']");
  if (!input) return;
  const label = input.closest(".gift");
  if (input.value !== ONLY_GIFT) {
    input.checked = false;
    giftButton.disabled = true;
    label.classList.remove("is-denied");
    void label.offsetWidth;
    label.classList.add("is-denied");
    giftMessage.textContent = `Nice try 😏 but ${input.value} isn't available. Only baby powder is on offer!`;
    return;
  }
  giftButton.disabled = false;
  giftMessage.textContent = "Excellent choice! Baby powder it is 🧴✨";
});

giftForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const chosen = new FormData(giftForm).get("gift");
  if (chosen !== ONLY_GIFT) {
    giftMessage.textContent = "Nice try 😏 but that isn't available. Only baby powder is on offer!";
    return;
  }
  burst(70);
  openWhatsApp("Charinwa’s birthday gift request for 15/10/2026: baby powder.");
});

document.querySelectorAll(".polaroid").forEach((button) => {
  button.addEventListener("click", () => {
    lightboxArt.replaceChildren(button.querySelector("img").cloneNode(true));
    lightboxCaption.textContent = button.dataset.caption;
    lightbox.showModal();
  });
});

document.querySelector("#lightbox-close").addEventListener("click", () => lightbox.close());

document.querySelector("#surprise").addEventListener("click", () => {
  document.querySelector("#surprise-note").hidden = false;
  burst(120);
});

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
renderWall(loadWishes());
tickClock();
setInterval(tickClock, 1000);
if (!reducedMotion) {
  burst(36);
  drawConfetti();
}
