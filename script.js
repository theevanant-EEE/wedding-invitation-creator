"use strict";

/* EDIT YOUR DETAILS HERE */
const C = {
  groom: "Arun", bride: "Priya",
  parents: { groom: "S/o Mr. K. Kumar & Mrs. L. Lakshmi", bride: "D/o Mr. R. Raman & Mrs. S. Saroja" },
  date: "2027-03-07T09:00:00+05:30",            // Muhurtham
  receptionDate: "2027-03-06T18:30:00+05:30",   // Reception
  venue: "Sri Krishnaswamy Kalyana Mandapam, T. Nagar, Chennai",
  mapsUrl: "https://maps.google.com/maps?cid=13172531660057699448",
  whatsapp: "919999999999",                      // country code + number
  story: [                                       // img: "photos/1.jpg" (leave "" for placeholder)
    { img: "img/ks (3).png", text: "We met as classmates" },
    { img: "img/ks (2).png", text: "Two families, one decision" },
    { img: "img/ks (1).png", text: "And now... forever" }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  const $ = s => document.querySelector(s);
  const W = new Date(C.date), R = new Date(C.receptionDate);
  const fmt = (d, o) => d.toLocaleDateString("en-IN", o);
  const time = d => d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  const guest = new URLSearchParams(location.search).get("guest"); // ?guest=Ravi

  /* TEXT */
  $("#greet").textContent = guest ? `Dear ${guest} & family,` : "Dear family & friends,";
  $("#groom").textContent = C.groom;
  $("#bride").textContent = C.bride;
  $("#parents").textContent = `${C.parents.groom}  |  ${C.parents.bride}`;
  $("#dateLine").textContent = fmt(W, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  $("#rec").textContent = `${fmt(R, { weekday: "long", day: "numeric", month: "long" })} · ${time(R)} onwards`;
  $("#muh").textContent = `${fmt(W, { weekday: "long", day: "numeric", month: "long" })} · ${time(W)}`;
  document.querySelectorAll(".venue").forEach(e => (e.textContent = C.venue));
  $("#map").href = C.mapsUrl;

  /* OPEN: doors slide apart, music starts on this first tap */
  $("#temple").innerHTML = temple();
  const intro = $("#intro"), bgm = $("#bgm"), mb = $("#music");
  const setP = on => mb.setAttribute("aria-pressed", on);

  /* Built-in temple-bell + drone music (used when music.mp3 is missing) */
  function synthStart() {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.linearRampToValueAtTime(0.14, ac.currentTime + 2);
    g.connect(ac.destination);
    [130.81, 196, 261.63].forEach((f, i) => {
      const o = ac.createOscillator(), l = ac.createGain();
      o.frequency.value = f; l.gain.value = [0.5, 0.35, 0.25][i];
      o.connect(l); l.connect(g); o.start();
    });
    let n = 0;
    const bell = () => {
      const o = ac.createOscillator(), b = ac.createGain(), t = ac.currentTime;
      o.type = "triangle"; o.frequency.value = [523.25, 659.25, 783.99, 659.25][n++ % 4];
      b.gain.setValueAtTime(0.0001, t);
      b.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
      b.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
      o.connect(b); b.connect(g); o.start(t); o.stop(t + 2.6);
    };
    bell();
    const timer = setInterval(bell, 2200);
    return { stop() { clearInterval(timer); ac.close(); } };
  }

  let synth = null, useSynth = false;
  function playMusic() {
    bgm.play().then(() => setP(true)).catch(() => {
      useSynth = true; synth = synthStart(); setP(true);   // music.mp3 missing or blocked
    });
  }

  $("#open").addEventListener("click", () => {
    intro.classList.add("open");
    document.body.classList.add("ready");
    playMusic();
    setTimeout(() => intro.remove(), 4300);
  }, { once: true });

  mb.addEventListener("click", () => {
    if (useSynth) {
      if (synth) { synth.stop(); synth = null; setP(false); }
      else { synth = synthStart(); setP(true); }
      return;
    }
    bgm.paused ? playMusic() : bgm.pause();
  });
  bgm.addEventListener("pause", () => setP(false));

  /* PETALS + THORANAM LEAVES */
  $("#petals").innerHTML = Array.from({ length: 14 }, () =>
    `<i style="left:${Math.random() * 100}%;animation-duration:${8 + Math.random() * 8}s;animation-delay:${-Math.random() * 12}s;--s:${8 + Math.random() * 10}px"></i>`).join("");
  $("#leaves").innerHTML = Array.from({ length: 16 }, (_, i) => `<i style="animation-delay:${-i * 0.25}s"></i>`).join("");

  /* STORY CARDS */
  $("#cards").innerHTML = C.story.map((s, i) =>
    `<figure class="card ${i % 2 ? "b" : "a"}"><div class="ph">${s.img ? `<img src="${s.img}" alt="${s.text}" loading="lazy">` : ["🎓", "👨‍👩‍👧‍👦", "💍"][i % 3]}</div><figcaption>${s.text}</figcaption></figure>`).join("");

  /* TEAR-OFF CALENDAR: sheets fly away, wedding date stays */
  const pad = $("#pad");
  pad.innerHTML = [...Array(7).keys()].map(i => {
    const d = new Date(W); d.setDate(W.getDate() - i);
    const x = (Math.random() > 0.5 ? 1 : -1) * (100 + Math.random() * 40) | 0;
    return `<div class="sheet" style="z-index:${i + 1};--r:${(Math.random() * 50 + 10) | 0}deg;--x:${x}%"><small>${fmt(d, { month: "long", year: "numeric" })}</small><b>${d.getDate()}</b><em>${fmt(d, { weekday: "long" })}</em></div>`;
  }).join("");
  const tear = () => [...pad.children].reverse().slice(0, -1)
    .forEach((e, i) => setTimeout(() => e.classList.add("gone"), 600 + i * 500));

  /* SCROLL REVEAL */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    if (e.target === pad) tear();
    io.unobserve(e.target);
  }), { threshold: 0.35 });
  document.querySelectorAll(".rv,#pad,.card").forEach(e => io.observe(e));

  /* VILAKKU COUNTDOWN: flame grows as the wedding gets closer */
  const cd = $("#cd");
  function tick() {
    const ms = Math.max(0, W - new Date());
    const d = ms / 864e5 | 0, h = ms / 36e5 % 24 | 0, m = ms / 6e4 % 60 | 0, s = ms / 1e3 % 60 | 0;
    cd.innerHTML = [[d, "Days"], [h, "Hours"], [m, "Mins"], [s, "Secs"]]
      .map(([n, l]) => `<div><b>${String(n).padStart(2, "0")}</b><span>${l}</span></div>`).join("");
    $("#vilakku").style.setProperty("--f", (0.55 + 0.95 * (1 - Math.min(d, 120) / 120)).toFixed(2));
  }
  tick(); setInterval(tick, 1000);

  /* SKY SHIFT: night (reception) to dawn (muhurtham) while scrolling */
  const ev = $("#events"), A = [13, 27, 61], B = [246, 198, 103];
  function sky() {
    const r = ev.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.8 - r.top) / (r.height * 0.8)));
    ev.style.background = `rgb(${A.map((a, i) => a + (B[i] - a) * p | 0)})`;
    $("#moon").style.opacity = 1 - p;
    $("#sun").style.opacity = p;
    ev.classList.toggle("day", p > 0.55);
  }
  addEventListener("scroll", sky, { passive: true }); sky();

  /* CALENDAR FILE + WHATSAPP RSVP */
  const z = d => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  $("#ics").addEventListener("click", () => {
    const t = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `SUMMARY:${C.groom} & ${C.bride} Wedding`,
      `DTSTART:${z(W)}`, `DTEND:${z(new Date(+W + 3.5 * 36e5))}`, `LOCATION:${C.venue}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([t], { type: "text/calendar" }));
    a.download = "wedding.ics"; a.click();
  });
  $("#rsvp").addEventListener("click", () => open(
    `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(`${guest ? guest + " here. " : ""}We will be attending ${C.groom} & ${C.bride}'s wedding. Congratulations!`)}`, "_blank"));
});


/* Original SVG gopuram: 5 colourful tiers, kalasams, carved door, lotus, banana leaves */
function temple() {
  const cols = ["#e86f3c", "#d6457a", "#1f9e8f", "#f2b34a", "#e86f3c"];
  let s = '<defs><radialGradient id="lg"><stop offset="0" stop-color="#fff6c8"/><stop offset="1" stop-color="#f0a52e"/></radialGradient></defs>';
  s += '<rect x="30" y="392" width="240" height="12" fill="#d9c7a3"/><rect x="42" y="404" width="216" height="12" fill="#c8b48c"/><rect x="54" y="416" width="192" height="12" fill="#b89f74"/>';
  s += '<rect x="45" y="300" width="210" height="92" fill="#f6ead0" stroke="#c9a15a" stroke-width="2"/><rect x="40" y="296" width="220" height="8" fill="#f3c552" stroke="#a9741a"/>';
  for (const x of [55, 85, 205, 235]) s += `<rect x="${x}" y="308" width="10" height="84" fill="#fff" stroke="#d8c38f"/>`;
  s += '<path d="M116 392V338a34 34 0 0 1 68 0V392z" fill="url(#lg)"/>';
  const stud = (xs) => xs.map(x => [334, 354, 374].map(y => `<circle cx="${x}" cy="${y}" r="2.2" fill="#f3c552"/>`).join("")).join("");
  s += `<g class="dl"><path d="M116 392V338a34 34 0 0 1 34-34V392z" fill="#6b2a14" stroke="#e8a317" stroke-width="2"/>${stud([128, 140])}</g>`;
  s += `<g class="dr"><path d="M184 392V338a34 34 0 0 0-34-34V392z" fill="#6b2a14" stroke="#e8a317" stroke-width="2"/>${stud([160, 172])}</g>`;
  let y = 296;
  for (let i = 0; i < 5; i++) {
    const w = 190 - i * 30, h = 46 - i * 2, x = 150 - w / 2;
    y -= h;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cols[i]}"/><rect x="${x - 5}" y="${y}" width="${w + 10}" height="6" fill="#f3c552" stroke="#a9741a"/>`;
    const n = Math.floor(w / 30);
    for (let k = 0; k < n; k++) {
      const cx = x + (k + 0.5) * w / n;
      s += `<path d="M${cx - 6} ${y + h}V${y + 20}a6 6 0 0 1 12 0V${y + h}z" fill="#fff3d6" stroke="#8a4b12" stroke-width=".8"/><circle cx="${cx}" cy="${y + 12}" r="2.2" fill="#f3c552"/>`;
    }
  }
  s += `<path d="M125 ${y}V${y - 8}a25 15 0 0 1 50 0V${y}z" fill="#c9552e" stroke="#f3c552" stroke-width="2"/>`;
  for (const dx of [-14, 0, 14]) s += `<ellipse cx="${150 + dx}" cy="${y - 27}" rx="4.5" ry="6.5" fill="#f3c552" stroke="#a9741a"/><path d="M${150 + dx} ${y - 33}l-2.5-6h5z" fill="#f3c552"/>`;
  s += '<path d="M262 392C246 340 266 300 300 276C292 320 288 360 274 392z" fill="#3f8f3a"/><path d="M270 396C262 350 280 322 300 310C298 340 296 370 284 396z" fill="#5fae4e"/>';
  const lotus = (cx, cy, r) => [-50, -25, 0, 25, 50].map(a => `<ellipse cx="${cx}" cy="${cy - r}" rx="${r * 0.45}" ry="${r}" transform="rotate(${a} ${cx} ${cy})" fill="${Math.abs(a) > 30 ? "#f48fb1" : "#f06292"}" stroke="#fff" stroke-width=".6"/>`).join("");
  return s + lotus(30, 394, 17) + lotus(58, 398, 12);
}
