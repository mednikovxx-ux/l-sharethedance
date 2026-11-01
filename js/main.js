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

// Запуск главной: каждое видео запускается и сразу выезжает сверху, следующее — за ним.
const hero = document.querySelector(".hero");
if (hero) {
  const phone = innerWidth <= 700, vids = [...hero.querySelectorAll(".hc")].slice(0, phone ? 1 : 3);
  const STEP = 300, FALL = 1000, still2 = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const launch = (v) => { v.play().catch(() => {}); v.classList.add("in"); };
  const whenReady = (v) => new Promise((res) => {
    if (v.readyState >= 3) return res();
    v.addEventListener("canplay", res, { once: true }); setTimeout(res, 1500);
  });
  if (still2) { vids.forEach((v) => { v.style.transition = "none"; launch(v); }); hero.classList.add("title", "ready"); }
  else (async () => {
    await Promise.all(vids.map(whenReady));
    vids.forEach((v, i) => setTimeout(() => launch(v), i * STEP));
    setTimeout(() => hero.classList.add("title", "ready"), (vids.length - 1) * STEP + FALL - 500);
  })();
  // Если браузер приостановил видео, продолжаем воспроизведение.
  const resume = () => vids.forEach((v) => { if (v.paused && v.classList.contains("in") && !document.hidden) v.play().catch(() => {}); });
  vids.forEach((v) => ["pause", "stalled"].forEach((e) => v.addEventListener(e, () => setTimeout(resume, 250))));
  document.addEventListener("visibilitychange", resume);
}
