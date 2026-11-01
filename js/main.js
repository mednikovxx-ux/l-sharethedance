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
// Видео направлений грузим, только когда до них дошли: на первом экране канал нужен героям.
Object.values(STYLES).forEach((s) => { if (vids[s.v]) return; const v = document.createElement("video"); Object.assign(v, { muted: true, loop: true, playsInline: true, preload: "none", poster: `img/${s.v}.webp` }); v.dataset.src = `video/${s.v}.mp4`; v.setAttribute("aria-hidden", "true"); stage.append(v); vids[s.v] = v; });
const load = (v) => { if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.preload = "auto"; } };
new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); load(first); first.play().catch(() => {}); Object.values(vids).forEach(load); } }, { rootMargin: "200px" }).observe(stage);
let current = "tango";
const show = (b) => {
  const s = STYLES[b.dataset.s];
  document.querySelectorAll(".menu button").forEach((x) => x.setAttribute("aria-pressed", x === b));
  text.textContent = s.t; who.textContent = s.w;
  if (s.v === current) return;
  load(vids[s.v]); vids[s.v].currentTime = 0; vids[s.v].play().catch(() => {}); vids[s.v].classList.add("on"); vids[current].classList.remove("on"); vids[current].pause(); current = s.v;
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

// Меню на телефоне.
const burger = document.querySelector(".burger");
burger.addEventListener("click", () => { const o = document.querySelector(".bar").classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
document.querySelectorAll("#siteNav a").forEach((a) => a.addEventListener("click", () => { document.querySelector(".bar").classList.remove("open"); burger.setAttribute("aria-expanded", false); }));

// Расписание: сегодняшний столбец и фильтр «взрослым / детям».
document.querySelectorAll(`.tt [data-day="${new Date().getDay()}"]`).forEach((el) => el.classList.add("today"));
document.querySelectorAll(".filter button").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll(".filter button").forEach((x) => x.setAttribute("aria-pressed", x === b));
  document.querySelectorAll(".c, .row-c").forEach((el) => { el.hidden = b.dataset.f !== "all" && el.dataset.k !== b.dataset.f; });
}));

// Запуск главной: видео запускается, через кадр его рамка выезжает сверху, следующее — за ним.
const hero = document.querySelector(".hero");
if (hero) {
  const phone = innerWidth <= 700, vids = [...hero.querySelectorAll(".hc")].slice(0, phone ? 1 : 3);
  const STEP = 450, FALL = 1200, calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (phone) { vids[0].poster = "img/hero-tall-0.webp"; vids[0].src = "video/hero-tall.mp4"; }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const once = (v, e, ms) => Promise.race([new Promise((r) => v.addEventListener(e, r, { once: true })), wait(ms)]);
  const buffered = (v) => (v.readyState >= 4 ? 0 : once(v, "canplaythrough", 900));
  const start = async (v) => { const p = once(v, "playing", 150); v.play().catch(() => {}); await p; };
  const slide = (v) => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => { v.parentElement.classList.add("in"); r(); })));
  (async () => {
    if (calm) { vids.forEach((v) => { v.parentElement.classList.add("in", "done"); v.play().catch(() => {}); }); hero.classList.add("title", "ready"); return; }
    await Promise.all(vids.map(buffered));
    for (let i = 0; i < vids.length; i++) {
      await start(vids[i]);
      await slide(vids[i]);
      if (i === vids.length - 1) { await wait(FALL - 600); hero.classList.add("title", "ready"); await wait(700); vids.forEach((v) => v.parentElement.classList.add("done")); }
      else await wait(STEP);
    }
  })();
  // Если браузер приостановил видео, продолжаем воспроизведение.
  const resume = () => vids.forEach((v) => { if (v.paused && v.parentElement.classList.contains("in") && !document.hidden) v.play().catch(() => {}); });
  vids.forEach((v) => ["pause", "stalled"].forEach((e) => v.addEventListener(e, () => setTimeout(resume, 250))));
  document.addEventListener("visibilitychange", resume);
}
