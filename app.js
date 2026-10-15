const STORAGE_KEY = "dhsEnglishTutorV1";

const defaultState = {
  profile: { baseline: 60, targetLow: 75, targetHigh: 80, phase: "Baseline diagnosis" },
  skills: [
    { id: "literal", label: "Literal comprehension", mastery: 60, state: "developing" },
    { id: "inference", label: "Inference", mastery: 48, state: "foundation gap" },
    { id: "evidence-selection", label: "Evidence selection", mastery: 50, state: "foundation gap" },
    { id: "reasoning-link", label: "Reasoning link", mastery: 45, state: "foundation gap" },
    { id: "own-words", label: "Own words", mastery: 52, state: "developing" },
    { id: "tone", label: "Tone & attitude", mastery: 50, state: "foundation gap" },
    { id: "language-effect", label: "Language effect", mastery: 48, state: "foundation gap" },
    { id: "summary", label: "Summary & synthesis", mastery: 50, state: "foundation gap" },
    { id: "language-control", label: "Language control", mastery: 58, state: "developing" }
  ],
  attempts: [],
  reviews: [],
  reading: {},
  prefs: { v: 2, focus: true, hideText: false, taskW: null },
  sources: [
    { title: "2026 Year 1 EOY English Paper 2 · Comprehension Insert", provenance: "DHS examination material", status: "Fully inspected", use: "Text range, section structure and stated duration" },
    { title: "1A ENGLISH Google Classroom", provenance: "DHS school account", status: "Inventory only", use: "Primary course and teacher-posted resources" },
    { title: "The Landlady · Reading Material for Narrative", provenance: "DHS teacher/school", status: "Partially inspected", use: "Narrative reading, character inference, atmosphere and evidence selection" },
    { title: "Narrative Comprehension Package", provenance: "DHS teacher/school", status: "Partially inspected", use: "School-taught narrative comprehension strategies" },
    { title: "Narrative Comprehension Practice 1–3 ANSWERS", provenance: "DHS teacher/school", status: "Partially inspected", use: "Post-attempt checking only; not an unseen baseline" },
    { title: "Y1 ERP 2026 Briefing", provenance: "DHS teacher/school", status: "Partially inspected", use: "Extensive Reading Programme expectations" },
    { title: "The Worlds I See · Chapter 1", provenance: "User-owned book", status: "Partially inspected", use: "Guided continuity reading; not exam calibration" },
    { title: "DHS English Programme", provenance: "Official public DHS page", status: "Fully inspected", use: "Broad programme alignment only" }
  ]
};

let state = loadState();
let currentReadingAttempt = null;
let currentPracticeAttempt = null;
let timerSeconds = 18 * 60;
let timerId = null;

const pageMeta = {
  today: ["Wednesday · 14 October 2026", "Today’s learning path"],
  reading: ["Actual text · guided reading", "DHS reading room"],
  practice: ["School materials · attempt first", "School practice lab"],
  progress: ["Evidence, not impressions", "Learning progress"],
  sources: ["Provenance and inspection", "Source library"]
};

const materialLibrary = {
  landlady: {
    title: "The Landlady",
    subtitle: "Reading Material for Narrative",
    preview: "https://drive.google.com/file/d/1IvySYl68-X-qyI3OAS03C-VG0VbNbEQj/preview?authuser=0",
    open: "https://drive.google.com/file/d/1IvySYl68-X-qyI3OAS03C-VG0VbNbEQj/view?usp=classroom_web&authuser=0",
    pages: "The Landlady · DHS Classroom PDF",
    note: "Source: 1A ENGLISH → Narrative Writing → The Landlady. Teacher-posted PDF; access requires the school Google account.",
    objective: "Infer a character trait, select two precise details, and explain the link.",
    question: "What impression do you get of Billy Weaver in the section you read? Support your answer with two details from the text.",
    sourceLabel: "The Landlady · DHS Classroom PDF",
    warning: "School reading text. Choose the exact section or question before starting the timer."
  },
  "narrative-notes": {
    title: "Narrative Comprehension Package",
    subtitle: "Y1 EL 2026 · 26 classroom slides",
    preview: "https://drive.google.com/file/d/1u3Ihox-nR3bZhYA3tR0mD-Ep03KPD5ED/preview?authuser=0",
    open: "https://drive.google.com/file/d/1u3Ihox-nR3bZhYA3tR0mD-Ep03KPD5ED/view?usp=classroom_web&authuser=0",
    pages: "Narrative Comprehension Package · DHS Classroom slides",
    note: "Source: 1A ENGLISH → Narrative Comprehension → Narrative Comprehension Notes. Teacher-posted PowerPoint.",
    objective: "Retrieve one school-taught comprehension strategy and apply it to an example.",
    question: "Which strategy from the selected slide would most improve your comprehension answer? Explain how you would use it.",
    sourceLabel: "Narrative Comprehension Package · DHS Classroom",
    warning: "School teaching notes. Use these to learn the strategy, then test it on an unseen question."
  },
  erp: {
    title: "Y1 Extensive Reading Programme",
    subtitle: "2026 teacher briefing",
    preview: "https://drive.google.com/file/d/182V8gad4IMiI5GRhX7mHAKq8P-J95Qsz/preview?authuser=0",
    open: "https://drive.google.com/file/d/182V8gad4IMiI5GRhX7mHAKq8P-J95Qsz/view?usp=classroom_web&authuser=0",
    pages: "Y1 ERP 2026 Briefing · DHS Classroom slides",
    note: "Source: 1A ENGLISH → Others → Extensive Reading Programme. Teacher-posted PowerPoint.",
    objective: "Identify the programme expectations and plan purposeful extensive reading.",
    question: "What are the two most important ERP expectations shown in the briefing, and how will you meet them?",
    sourceLabel: "Y1 ERP 2026 Briefing · DHS Classroom",
    warning: "School programme briefing, not an examination text."
  },
  "narrative-answers": {
    title: "Narrative Comprehension Practice 1–3 Answers",
    subtitle: "Y1 EL 2026 · teacher answer package",
    preview: "https://drive.google.com/file/d/1mLZOrh2LwOrSSKfJTZMe0ehwmCiCeV_G/preview?authuser=0",
    open: "https://drive.google.com/file/d/1mLZOrh2LwOrSSKfJTZMe0ehwmCiCeV_G/view?usp=classroom_web&authuser=0",
    pages: "Narrative Comprehension Practice 1–3 Answers · DHS Classroom",
    note: "Source: 1A ENGLISH → Narrative Comprehension → Practice 1–3 Answers. Teacher-posted PowerPoint.",
    objective: "Compare the first attempt with the teacher material and diagnose one lost-mark cause.",
    question: "Question selected from the corresponding Narrative Comprehension Practice 1–3 worksheet.",
    sourceLabel: "Narrative Comprehension Practice 1–3 · DHS Classroom",
    warning: "Answer material: open this only after completing the corresponding Practice 1–3 questions from your own file."
  }
};

const localObjectUrls = { reading: null, practice: null };

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.skills && saved.sources) {
      saved.reading ||= {};
      if (!saved.prefs || saved.prefs.v !== 2) saved.prefs = { v: 2, focus: true, hideText: false, taskW: null };
      return saved;
    }
    return structuredClone(defaultState);
  } catch { return structuredClone(defaultState); }
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
}

let persistTimer = null;
function persistSoon() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(persist, 300);
}

function saveState() {
  persist();
  renderAll();
}

function todayISO() { return new Date().toISOString().slice(0, 10); }
function plusDays(days) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

function showView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === `view-${name}`));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  document.querySelector("#page-eyebrow").textContent = pageMeta[name][0];
  document.querySelector("#page-title").textContent = pageMeta[name][1];
  document.querySelector(".sidebar").classList.remove("open");
  document.body.classList.remove("nav-open");
  if (name === "reading") renderReader();
  applyReaderPrefs();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderSelects() {
  const skillSelect = document.querySelector("#practice-skill");
  skillSelect.innerHTML = state.skills.map(s => `<option value="${s.id}">${s.label}</option>`).join("");
  skillSelect.value = "inference";
  const gapOptions = [
    ["task-command", "Task or command misunderstood"], ["literal", "Literal comprehension / vocabulary"],
    ["inference", "Inference"], ["evidence-selection", "Evidence selection"], ["own-words", "Own words / paraphrase"],
    ["reasoning-link", "Reasoning or explanation"], ["language-control", "Grammar / language control"],
    ["time-control", "Time control / incomplete response"]
  ];
  document.querySelector("#practice-gap").innerHTML = gapOptions.map(([v,l]) => `<option value="${v}">${l}</option>`).join("");
}

function renderSkillMap() {
  document.querySelector("#skill-map").innerHTML = state.skills.map(s => `
    <div class="skill-row">
      <strong>${escapeHtml(s.label)}</strong>
      <div class="skill-track"><div class="skill-fill" style="width:${Math.max(4, Math.min(100, s.mastery))}%"></div></div>
      <span class="skill-state">${escapeHtml(s.state)}</span>
    </div>`).join("");
}

function renderEvidence() {
  const box = document.querySelector("#evidence-list");
  if (!state.attempts.length) {
    box.innerHTML = `<p class="empty-state">No independent attempt has been recorded yet. Guided work will appear here after the student responds.</p>`;
    return;
  }
  box.innerHTML = [...state.attempts].reverse().slice(0, 8).map(a => `
    <div class="evidence-item"><strong>${escapeHtml(a.type)} · ${a.scoreLabel}</strong><span>${escapeHtml(a.date)} · ${escapeHtml(a.skillLabel)} · ${escapeHtml(a.support || "First attempt")}</span>${a.stepSummary ? `<span>${escapeHtml(a.stepSummary)} · main gap: ${escapeHtml(a.gapLabel)}</span>` : ""}</div>`).join("");
}

function renderReviews() {
  const due = state.reviews.filter(r => !r.complete);
  document.querySelector("#review-count").textContent = due.length;
  const box = document.querySelector("#today-review-list");
  box.innerHTML = due.length ? due.slice(0, 4).map(r => `<div class="review-item"><strong>${escapeHtml(r.skillLabel)}</strong><span>Review ${escapeHtml(r.due)} · ${escapeHtml(r.task)}</span></div>`).join("") : `<p class="empty-state">No review is scheduled yet. Save a marked attempt to create one.</p>`;
}

function renderSources() {
  document.querySelector("#source-table-body").innerHTML = state.sources.map(s => {
    const full = s.status === "Fully inspected" ? " full" : "";
    return `<tr><td>${escapeHtml(s.title)}</td><td>${escapeHtml(s.provenance)}</td><td><span class="status-label${full}">${escapeHtml(s.status)}</span></td><td>${escapeHtml(s.use)}</td></tr>`;
  }).join("");
}

function renderParentSnapshot() {
  const latest = state.attempts.at(-1);
  const el = document.querySelector("#parent-snapshot");
  if (!latest) return;
  el.textContent = `Latest evidence: ${latest.scoreLabel} on ${latest.skillLabel}. Priority next step: ${latest.gapLabel}. This is ${latest.support === "Independent" ? "independent" : "supported"} evidence.`;
}

function renderAll() { renderSelects(); renderSkillMap(); renderEvidence(); renderReviews(); renderSources(); renderParentSnapshot(); }

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]);
}

function showMaterialSurface(context, mode) {
  if (context === "reading") return showReadingSurface(mode);
  const frame = document.querySelector(`#${context}-material-frame`);
  const image = document.querySelector(`#${context}-material-image`);
  const textBox = document.querySelector(`#${context}-material-text`);
  frame.classList.toggle("hidden", mode !== "frame");
  image.classList.toggle("hidden", mode !== "image");
  textBox.classList.toggle("hidden", mode !== "text");
}

function selectMaterial(context, key) {
  const material = materialLibrary[key];
  if (!material) return;
  if (localObjectUrls[context]) URL.revokeObjectURL(localObjectUrls[context]);
  localObjectUrls[context] = null;
  const frame = document.querySelector(`#${context}-material-frame`);
  const openLink = document.querySelector(`#${context}-open-source`);
  frame.src = material.preview;
  frame.title = material.title;
  openLink.href = material.open;
  openLink.classList.remove("hidden");
  showMaterialSurface(context, "frame");

  if (context === "reading") {
    readingMaterialKey = key;
    localReadingName = null;
    document.querySelector("#reading-source-title").textContent = material.title;
    document.querySelector("#reading-source-subtitle").textContent = material.subtitle;
    document.querySelector("#reading-source-note").innerHTML = `<strong>Source:</strong> ${escapeHtml(material.note.replace(/^Source:\s*/, ""))}`;
    if (key === "landlady") {
      PdfView.clear();
      restoreLandladyPdf().then(ok => { if (!ok) renderReader(); });
    } else {
      PdfView.clear();
    }
    renderReader();
  } else {
    document.querySelector("#practice-source").value = material.sourceLabel;
    document.querySelector("#practice-question").value = material.question;
    const warning = document.querySelector("#practice-material-warning");
    warning.textContent = material.warning;
    warning.classList.remove("hidden");
  }
}

async function loadLocalMaterial(context, file) {
  if (!file) return;
  if (context === "reading") return loadReadingFile(file);
  if (localObjectUrls[context]) URL.revokeObjectURL(localObjectUrls[context]);
  const frame = document.querySelector(`#${context}-material-frame`);
  const image = document.querySelector(`#${context}-material-image`);
  const textBox = document.querySelector(`#${context}-material-text`);
  const openLink = document.querySelector(`#${context}-open-source`);
  openLink.classList.add("hidden");

  if (file.type.startsWith("image/")) {
    localObjectUrls[context] = URL.createObjectURL(file);
    image.src = localObjectUrls[context];
    image.alt = file.name;
    showMaterialSurface(context, "image");
  } else if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    localObjectUrls[context] = URL.createObjectURL(file);
    frame.src = localObjectUrls[context];
    frame.title = file.name;
    showMaterialSurface(context, "frame");
  } else {
    textBox.textContent = await file.text();
    showMaterialSurface(context, "text");
  }

  if (context === "reading") {
    localReadingName = file.name;
    document.querySelector("#reading-source-title").textContent = file.name;
    document.querySelector("#reading-source-subtitle").textContent = "Local study material";
    document.querySelector("#reading-source-note").innerHTML = "<strong>Local file:</strong> displayed only in this browser session; it has not been uploaded to the site.";
    renderReader();
  } else {
    document.querySelector("#practice-source").value = file.name;
    document.querySelector("#practice-question").value = `Question selected from ${file.name}`;
    document.querySelector("#practice-material-warning").textContent = "Local file: displayed only in this browser session; it has not been uploaded to the site.";
  }
  showToast(`${file.name} loaded in the material reader.`);
}

function updateSkill(id, percentage, supported) {
  const skill = state.skills.find(s => s.id === id) || state.skills.find(s => s.id === "literal");
  if (!skill || Number.isNaN(percentage)) return;
  const weight = supported ? 0.16 : 0.28;
  skill.mastery = Math.round(skill.mastery * (1 - weight) + percentage * weight);
  skill.state = skill.mastery >= 80 ? "exam-ready" : skill.mastery >= 55 ? "developing" : "foundation gap";
}

document.querySelectorAll(".nav-item").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.view)));
document.querySelectorAll("[data-go]").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.go)));
document.querySelector(".mobile-menu").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
document.querySelector("#reading-material-select").addEventListener("change", e => selectMaterial("reading", e.target.value));
document.querySelector("#practice-material-select").addEventListener("change", e => selectMaterial("practice", e.target.value));
document.querySelector("#reading-local-file").addEventListener("change", e => loadLocalMaterial("reading", e.target.files[0]));
document.querySelector("#practice-local-file").addEventListener("change", e => loadLocalMaterial("practice", e.target.files[0]));

document.querySelector("#timer-toggle").addEventListener("click", e => {
  if (timerId) { clearInterval(timerId); timerId = null; e.target.textContent = "Resume"; return; }
  e.target.textContent = "Pause";
  timerId = setInterval(() => {
    timerSeconds = Math.max(0, timerSeconds - 1);
    const min = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
    const sec = String(timerSeconds % 60).padStart(2, "0");
    document.querySelector("#timer-display").textContent = `${min}:${sec}`;
    if (!timerSeconds) { clearInterval(timerId); timerId = null; e.target.textContent = "Done"; showToast("Reading time complete. Finish the meaning check."); }
  }, 1000);
});

document.querySelector("#practice-form").addEventListener("submit", e => {
  e.preventDefault();
  currentPracticeAttempt = {
    id: crypto.randomUUID(), date: todayISO(), type: "Exam practice",
    source: document.querySelector("#practice-source").value.trim(), skillId: document.querySelector("#practice-skill").value,
    max: Number(document.querySelector("#practice-marks").value), command: document.querySelector("#practice-command").value.trim(),
    paragraphRole: document.querySelector("#practice-role").value.trim(), evidenceZone: document.querySelector("#practice-zone").value.trim(),
    question: document.querySelector("#practice-question").value.trim(), firstAnswer: document.querySelector("#practice-answer").value.trim()
  };
  document.querySelector("#practice-score").max = currentPracticeAttempt.max;
  document.querySelector("#practice-review").classList.remove("hidden");
  document.querySelector("#practice-review").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("First answer locked. The tutor can now mark what is actually present.");
});

document.querySelector("#save-practice").addEventListener("click", () => {
  if (!currentPracticeAttempt) return showToast("Lock the first answer before saving a result.");
  const score = Math.min(currentPracticeAttempt.max, Math.max(0, Number(document.querySelector("#practice-score").value)));
  const support = document.querySelector("#practice-support").value;
  const skill = state.skills.find(s => s.id === currentPracticeAttempt.skillId);
  const gapValue = document.querySelector("#practice-gap").value;
  const gapLabel = document.querySelector("#practice-gap").selectedOptions[0].textContent;
  state.attempts.push({ ...currentPracticeAttempt, score, scoreLabel: `${score} / ${currentPracticeAttempt.max}`, skillLabel: skill.label, gapLabel, support, note: document.querySelector("#practice-note").value.trim(), retry: document.querySelector("#practice-retry").value.trim() });
  state.reviews.push({ id: crypto.randomUUID(), skillId: currentPracticeAttempt.skillId, skillLabel: skill.label, due: plusDays(score === currentPracticeAttempt.max && support === "Independent" ? 7 : 3), task: "Unseen transfer item", complete: false });
  updateSkill(currentPracticeAttempt.skillId, currentPracticeAttempt.max ? score / currentPracticeAttempt.max * 100 : 0, support !== "Independent");
  if (state.skills.some(s => s.id === gapValue)) updateSkill(gapValue, 40, true);
  saveState(); currentPracticeAttempt = null;
  showToast("Evidence saved and review scheduled."); showView("progress");
});

document.querySelector("#add-source-toggle").addEventListener("click", () => document.querySelector("#source-form").classList.toggle("hidden"));
document.querySelector("#source-form").addEventListener("submit", e => {
  e.preventDefault();
  state.sources.push({ title: document.querySelector("#source-title").value.trim(), provenance: document.querySelector("#source-provenance").value, status: document.querySelector("#source-status").value, use: document.querySelector("#source-use").value.trim() });
  saveState(); e.target.reset(); e.target.classList.add("hidden"); showToast("Source added with provenance and inspection status.");
});

document.querySelector("#export-data").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = `dhs-english-tutor-backup-${todayISO()}.json`; a.click(); URL.revokeObjectURL(url);
});

document.querySelector("#import-data").addEventListener("change", async e => {
  const file = e.target.files[0]; if (!file) return;
  try { const next = JSON.parse(await file.text()); if (!next.skills || !next.sources || !Array.isArray(next.attempts)) throw new Error(); next.reading ||= {}; next.prefs = (next.prefs && next.prefs.v === 2) ? next.prefs : { v: 2, focus: true, hideText: false, taskW: null }; state = next; saveState(); renderReader(); showToast("Backup imported."); }
  catch { showToast("That file is not a valid tutor backup."); }
  e.target.value = "";
});

document.querySelector("#clear-data").addEventListener("click", () => {
  if (!confirm("Reset all locally saved attempts, reviews and custom sources?")) return;
  state = structuredClone(defaultState); saveState(); renderReader(); showToast("Local learning data reset.");
});

renderAll();
initReader();
renderReader();
