// Unified Map of SeokhyeonLeeMed GitHub
// Sites are data; the map (graticule, contours, routes, pins) is drawn from it.
"use strict";

const OWNER = "SeokhyeonLeeMed";
const PAGES = "https://seokhyeonleemed.github.io/";

const SITES = [
  {
    repo: "med-quiz", name: "KU MedQ", kind: "med", locked: true,
    title: "의대 강의 퀴즈",
    desc: "강의노트와 기출로 만든 개인 학습용 퀴즈. 학년·과목·주차를 고르면 문항마다 선지별 해설, 강의노트 인용, 슬라이드 사진을 보여 줍니다.",
    at: [190, 175],
  },
  {
    repo: "med-map", name: "메디컬 맵", kind: "med", locked: false,
    title: "의과대학·수련병원 지도",
    desc: "한국·일본의 의과·치과대학과 수련병원을 한 지도에서 찾아봅니다. 권역·기관 유형·병원 특성으로 거르고, 전공의 정원과 진료과목을 확인할 수 있습니다.",
    at: [330, 385],
  },
  {
    repo: "lang-study", name: "외국어 공부", kind: "study", locked: true,
    title: "일본어·중국어·러시아어",
    desc: "일본어·중국어·러시아어를 하루(Day) 단위로 공부하는 학습 사이트. 원어민 음성, 정리 테스트, 5일마다 종합 점검이 있고 기록은 서버에 저장됩니다.",
    at: [525, 150],
  },
  {
    repo: "general_assistant", name: "General Assistant", kind: "life", locked: true,
    title: "개인 비서 대시보드",
    desc: "가계 점검, 식단표, 할 일, 투자 기록을 한곳에서 보는 개인 대시보드. 원본 자료를 읽기만 해서 보여 줍니다.",
    at: [700, 375],
  },
  {
    repo: "fretaid", name: "FretAid", kind: "music", locked: false,
    title: "기타·베이스 지판",
    desc: "기타와 베이스를 위한 인터랙티브 지판. 원하는 튜닝에서 스케일·코드 모양을 찾아 주고, 소리 재생과 마이크 튜너, 6개 언어를 지원합니다.",
    at: [850, 170],
  },
];

const KIND = {
  med:   { label: "의학" },
  study: { label: "어학" },
  life:  { label: "생활" },
  music: { label: "음악" },
};

const NS = "http://www.w3.org/2000/svg";
const W = 1000, H = 540;

function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

// Small deterministic PRNG so the terrain is the same on every visit.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// A closed, smooth, slightly irregular ring around (cx, cy).
function ring(cx, cy, r, ph, sq = 0.82) {
  const pts = [];
  const N = 48;
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    const k = 1 + 0.13 * Math.sin(3 * t + ph[0]) + 0.07 * Math.sin(5 * t + ph[1]) + 0.04 * Math.sin(2 * t + ph[2]);
    pts.push([cx + Math.cos(t) * r * k, cy + Math.sin(t) * r * k * sq]);
  }
  // Catmull-Rom → cubic Bézier, closed
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + "Z";
}

function drawGraticule(g) {
  for (let x = 100; x < W; x += 100) el("line", { x1: x, y1: 0, x2: x, y2: H, class: "grid" }, g);
  for (let y = 90; y < H; y += 90) el("line", { x1: 0, y1: y, x2: W, y2: y, class: "grid" }, g);
  // edge ticks with coordinates, like a sheet map
  for (let x = 100; x < W; x += 100) {
    const t = el("text", { x: x + 4, y: 14, class: "tick" }, g);
    t.textContent = `${126 + x / 100}°E`;
  }
  for (let y = 90; y < H; y += 90) {
    const t = el("text", { x: 6, y: y - 5, class: "tick" }, g);
    t.textContent = `${38 - y / 90}°N`;
  }
  el("rect", { x: 1, y: 1, width: W - 2, height: H - 2, class: "neat" }, g);
}

function drawWater(g) {
  el("path", {
    class: "river",
    d: "M-10 500 C 120 470, 200 520, 300 480 S 470 430, 560 455 S 760 520, 1010 470",
  }, g);
  el("path", {
    class: "river thin",
    d: "M560 455 C 590 400, 610 330, 600 260 S 640 150, 700 90",
  }, g);
  const t = el("text", { x: 820, y: 512, class: "water-label" }, g);
  t.textContent = "commit river";
}

function drawContours(g) {
  const r = rng(20261121);
  SITES.forEach((s, i) => {
    const [cx, cy] = s.at;
    const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
    const levels = 6;
    const base = 86 + r() * 20;
    for (let k = levels; k >= 1; k--) {
      el("path", {
        d: ring(cx + (levels - k) * 1.5, cy + 14 - (levels - k) * 1.2, (base * k) / levels, ph),
        class: k % 3 === 0 ? "contour index" : "contour",
      }, g);
    }
    // elevation label on the outer index contour
    const lab = el("text", { x: cx + base * 0.62, y: cy + base * 0.42, class: "elev" }, g);
    lab.textContent = `${(i + 1) * 120 + 40}`;
  });
  // a few stray hills for texture
  [[60, 300, 40], [440, 300, 46], [610, 520, 38], [960, 330, 50], [430, 40, 30]].forEach(([x, y, b]) => {
    const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
    for (let k = 3; k >= 1; k--) el("path", { d: ring(x, y, (b * k) / 3, ph), class: "contour faint" }, g);
  });
}

function drawRoutes(g) {
  const p = SITES.map((s) => s.at);
  const seq = [0, 1, 2, 3, 4];
  for (let i = 0; i < seq.length - 1; i++) {
    const a = p[seq[i]], b = p[seq[i + 1]];
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const bend = i % 2 ? -60 : 60;
    el("path", { d: `M${a[0]} ${a[1]} Q ${mx + bend * 0.4} ${my + bend} ${b[0]} ${b[1]}`, class: "route" }, g);
  }
}

function symbol(kind, g, x, y, s = 11) {
  const c = `mark mark-${kind}`;
  switch (kind) {
    case "med":   return el("path", { d: `M${x - s * 0.35} ${y - s}h${s * 0.7}v${s * 0.65}h${s * 0.65}v${s * 0.7}h-${s * 0.65}v${s * 0.65}h-${s * 0.7}v-${s * 0.65}h-${s * 0.65}v-${s * 0.7}h${s * 0.65}z`, class: c }, g);
    case "study": return el("path", { d: `M${x} ${y - s}L${x + s} ${y + s * 0.8}H${x - s}z`, class: c }, g);
    case "life":  return el("rect", { x: x - s * 0.8, y: y - s * 0.8, width: s * 1.6, height: s * 1.6, class: c }, g);
    default:      return el("circle", { cx: x, cy: y, r: s * 0.9, class: c }, g);
  }
}

function drawPins(g) {
  SITES.forEach((s, i) => {
    const [x, y] = s.at;
    const a = el("a", { href: PAGES + s.repo + "/", class: "pin", "data-i": i, "aria-label": `${i + 1}. ${s.name}` }, g);
    el("circle", { cx: x, cy: y, r: 30, class: "halo" }, a);
    symbol(s.kind, a, x, y);
    const nx = x + 22, ny = y - 22;
    el("circle", { cx: nx, cy: ny, r: 11, class: "num-bg" }, a);
    const n = el("text", { x: nx, y: ny + 4, class: "num" }, a);
    n.textContent = i + 1;
    const lab = el("text", { x, y: y + 40, class: "pin-label" }, a);
    lab.textContent = s.name;
  });
}

function drawFurniture(g) {
  // north arrow, near the left margin where the terrain is empty
  const fx = 48, fy = 96;
  el("path", { d: `M${fx} ${fy - 34}L${fx + 12} ${fy}L${fx} ${fy - 8}L${fx - 12} ${fy}z`, class: "north" }, g);
  const n = el("text", { x: fx, y: fy + 18, class: "north-n" }, g);
  n.textContent = "N";
  // scale bar
  const sx = 40, sy = 510;
  for (let i = 0; i < 4; i++) el("rect", { x: sx + i * 40, y: sy, width: 40, height: 7, class: i % 2 ? "bar light" : "bar" }, g);
  for (let i = 0; i <= 4; i++) {
    const st = el("text", { x: sx + i * 40, y: sy - 6, class: "tick scale" }, g);
    st.textContent = String(i);
  }
  const unit = el("text", { x: sx + 172, y: sy + 7, class: "tick" }, g);
  unit.textContent = "repos";
}

const LOCK = '<svg class="lock-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7.5" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none"/></svg>';

function renderList() {
  const ol = document.getElementById("sites");
  ol.innerHTML = SITES.map((s, i) => `
    <li class="site" data-i="${i}">
      <a class="site-main" href="${PAGES}${s.repo}/">
        <span class="badge sym-${s.kind}" aria-hidden="true">${i + 1}</span>
        <span class="site-text">
          <span class="site-name">${s.name}${s.locked ? LOCK : ""}</span>
          <span class="site-title">${s.title}</span>
          <span class="site-desc">${s.desc}</span>
        </span>
      </a>
      <span class="site-meta mono">
        <span class="kind">${KIND[s.kind].label}</span>
        <span class="updated" data-repo="${s.repo}"></span>
        <a class="repo" href="https://github.com/${OWNER}/${s.repo}">${OWNER}/${s.repo} ↗</a>
      </span>
    </li>`).join("");
  document.getElementById("count").textContent = SITES.length;
}

// Hovering a pin lights its legend entry and the other way round.
function linkHover() {
  const set = (i, on) => {
    document.querySelectorAll(`[data-i="${i}"]`).forEach((n) => n.classList.toggle("hot", on));
  };
  document.querySelectorAll("[data-i]").forEach((n) => {
    const i = n.getAttribute("data-i");
    n.addEventListener("mouseenter", () => set(i, true));
    n.addEventListener("mouseleave", () => set(i, false));
    n.addEventListener("focusin", () => set(i, true));
    n.addEventListener("focusout", () => set(i, false));
  });
}

// Last push time from the public GitHub API. Optional: the page is complete without it.
async function loadUpdated() {
  try {
    const r = await fetch(`https://api.github.com/users/${OWNER}/repos?per_page=100`);
    if (!r.ok) return;
    const repos = await r.json();
    const by = Object.fromEntries(repos.map((x) => [x.name, x]));
    document.querySelectorAll(".updated").forEach((n) => {
      const x = by[n.dataset.repo];
      if (!x) return;
      const d = new Date(x.pushed_at);
      n.textContent = `갱신 ${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });
  } catch (_) { /* offline or rate-limited: leave blank */ }
}

drawGraticule(document.getElementById("graticule"));
drawWater(document.getElementById("water"));
drawContours(document.getElementById("contours"));
drawRoutes(document.getElementById("routes"));
drawPins(document.getElementById("pins"));
drawFurniture(document.getElementById("furniture"));
renderList();
linkHover();
loadUpdated();
