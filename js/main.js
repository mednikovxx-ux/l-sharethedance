// Share The Dance: выбор танца, появление секций, масштаб названия при прокрутке.
document.documentElement.classList.add("js");
const TG = "https://t.me/share_the_dance";
const STYLES = {
  tango: { v: "tango", t: "Близкое объятие, импровизация и разговор без слов. Партнёр не нужен: на группах в паре с вами встанет преподаватель.", w: "Алексей Шершнев" },
  ballroom: { v: "ballroom", t: "Классика, осанка и лёгкость. Для тех, кто хочет танцевать красиво, в том числе в паре с ребёнком или перед конкурсом.", w: "Алексей Шершнев, Дмитрий Кольчугин" },
  bachata: { v: "bachata", t: "Самый тёплый социальный танец. Быстро учит вести и следовать, а на вечеринках вы уже не стоите у стены.", w: "Иван Горюнов, Алина Кабернюк" },
  lady: { v: "lady", t: "Пластика, мягкость и уверенность в себе. Подходит новичкам, даже если вы никогда раньше не танцевали.", w: "Алина Кабернюк, Ульяна Железнякова, Оля Макарушина" },
  swing: { v: "lindy", t: "Весёлый парный танец: свобода, улыбки и много движения.", w: "Алексей Шершнев" },
  jazz: { v: "jazz", t: "Джаз-фанк, контемпорари и Vogue для тех, кому хочется драйва и ритма.", w: "Мария Панова" },
};
// Все видео лежат стопкой и заранее загружены: наведение на направление мгновенно показывает нужное.
const stage = document.getElementById("stageMedia");
if (stage) {
const text = document.getElementById("stageText"), who = document.getElementById("stageWho");
const first = stage.querySelector("video"), vids = { tango: first };
Object.values(STYLES).forEach((s) => { if (vids[s.v]) return; const v = document.createElement("video"); Object.assign(v, { muted: true, loop: true, playsInline: true, preload: "auto", poster: `img/${s.v}.jpg`, src: `video/${s.v}.mp4` }); v.setAttribute("aria-hidden", "true"); stage.append(v); vids[s.v] = v; });
let current = "tango";
const show = (b) => {
  const s = STYLES[b.dataset.s];
  document.querySelectorAll(".menu button").forEach((x) => x.setAttribute("aria-pressed", x === b));
  text.textContent = s.t; who.textContent = s.w;
  if (s.v === current) return;
  vids[s.v].currentTime = 0; vids[s.v].play().catch(() => {}); vids[s.v].classList.add("on"); vids[current].classList.remove("on"); current = s.v;
};
document.querySelectorAll(".menu button").forEach((b) => { ["mouseenter", "focus", "click"].forEach((e) => b.addEventListener(e, () => show(b))); });
}

const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".rv").forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 70}ms`; io.observe(el); });

// Видео в подвале грузим, только когда до него доскроллили.
const lazy = document.querySelector("video[data-lazy]");
new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { lazy.src = lazy.dataset.lazy; o.disconnect(); } }, { rootMargin: "400px" }).observe(lazy);

const bar = document.querySelector(".bar"), mark = document.getElementById("wordmark"), still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const onScroll = () => {
  const y = scrollY, h = innerHeight;
  bar.classList.toggle("on", y > h * .7 || !mark);
  if (!still && mark) mark.style.transform = `scale(${1 - Math.min(y / h, 1) * .12}) translateY(${-y * .12}px)`;
};
addEventListener("scroll", onScroll, { passive: true }); onScroll();

// На странице расписания подсвечиваем сегодняшний день.
document.querySelector(`.day[data-day="${new Date().getDay()}"]`)?.classList.add("today");

// Запуск главной: колонки живого видео спускаются сверху по очереди и встают в ряд.
// Все колонки рисуются на холсте из одного идущего видео, поэтому они играют уже в полёте и не расходятся.
const hero = document.querySelector(".hero"), heroVideo = document.querySelector(".hero-video");
if (hero) {
  const phone = innerWidth <= 700, frame = new Image(), FALL = 1000, STEP = 300;
  frame.src = phone ? "img/hero-tall-0.jpg" : "img/hero-wide-0.jpg";
  const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.className = "hero-canvas"; canvas.setAttribute("aria-hidden", "true");
  heroVideo.after(canvas);
  const size = () => { canvas.width = hero.clientWidth * dpr; canvas.height = hero.clientHeight * dpr; };
  size(); ctx.fillStyle = "#0D2A23"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const VW = phone ? 720 : 1920, VH = phone ? 1280 : 960, cols = phone ? [0, 720] : [0, 638, 1282, 1920];
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const run = () => {
    const t0 = performance.now(), W = canvas.width, H = canvas.height, k = Math.max(W / VW, H / VH), ox = (W - VW * k) / 2, oy = (H - VH * k) / 2;
    const total = FALL + (cols.length - 2) * STEP;
    const draw = (now) => {
      const src = heroVideo.readyState >= 2 ? heroVideo : frame, t = now - t0;
      ctx.fillStyle = "#0D2A23"; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < cols.length - 1; i++) {
        const p = ease(Math.min(1, Math.max(0, (t - i * STEP) / FALL)));
        if (p > 0) ctx.drawImage(src, cols[i], 0, cols[i + 1] - cols[i], VH, ox + cols[i] * k, oy - (1 - p) * H, (cols[i + 1] - cols[i]) * k, VH * k);
      }
      if (t > total - 500) hero.classList.add("title");
      if (t < total) requestAnimationFrame(draw);
      else { hero.classList.add("ready"); heroVideo.play().catch(() => {}); setTimeout(() => canvas.remove(), 150); }
    };
    requestAnimationFrame(draw);
  };
  // Стартуем сразу: первый кадр уже загружен, а видео подхватывается на лету.
  let started = false; const go = () => { if (!started) { started = true; run(); } };
  heroVideo.addEventListener("playing", go, { once: true });
  heroVideo.play().catch(() => {});
  frame.onload = () => setTimeout(go, 150);
  setTimeout(go, 500);
  // Если браузер приостановил видео или ему не хватило загрузки, продолжаем воспроизведение.
  ["pause", "stalled", "waiting"].forEach((e) => heroVideo.addEventListener(e, () => setTimeout(() => { if (heroVideo.paused && !document.hidden) heroVideo.play().catch(() => {}); }, 250)));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) heroVideo.play().catch(() => {}); });
}
