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
const video = document.getElementById("stageVideo"), text = document.getElementById("stageText"), who = document.getElementById("stageWho");
document.querySelectorAll(".menu button").forEach((b) => b.addEventListener("click", () => {
  const s = STYLES[b.dataset.s];
  document.querySelectorAll(".menu button").forEach((x) => x.setAttribute("aria-pressed", x === b));
  text.textContent = s.t; who.textContent = s.w;
  video.style.opacity = 0;
  setTimeout(() => { video.poster = `img/${s.v}.jpg`; video.src = `video/${s.v}.mp4`; video.play().catch(() => {}); video.style.opacity = 1; }, 220);
}));

const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".rv").forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 70}ms`; io.observe(el); });

// Видео в подвале грузим, только когда до него доскроллили.
const lazy = document.querySelector("video[data-lazy]");
new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { lazy.src = lazy.dataset.lazy; o.disconnect(); } }, { rootMargin: "400px" }).observe(lazy);

const bar = document.querySelector(".bar"), mark = document.getElementById("wordmark"), still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const onScroll = () => {
  const y = scrollY, h = innerHeight;
  bar.classList.toggle("on", y > h * .7);
  if (!still) mark.style.transform = `scale(${1 - Math.min(y / h, 1) * .12}) translateY(${-y * .12}px)`;
};
addEventListener("scroll", onScroll, { passive: true }); onScroll();
