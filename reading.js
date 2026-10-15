/* DHS English Studio — Guided reading engine (v1.2)
   Flow per section: range → A gist → B key detail → C inference.
   Every question gets its model answer the moment the student checks it (or earlier, on request).
   After C: rewrite in own words → review → unlock the next section.
   After all sections: whole-story summary.
   Depends on globals from app.js and pdfview.js. */

const GIST_RANGE = [20, 35];
const FINAL_RANGE = [80, 120];

const STEP_META = {
  A: { title: "Section gist", meta: "1 sentence · literal comprehension" },
  B: { title: "Key detail", meta: "copy the words · explain in your own words" },
  C: { title: "Inference", meta: "3 marks · inference + reasoning link" }
};

const lessons = {
  landlady: {
    key: "landlady",
    title: "The Landlady",
    segments: LANDLADY_SEGMENTS,
    demo: {
      title: "Watch first: a model on a different text",
      passage: "Mei Ling stood at the school gate long after the last bell. The other students had gone, but she kept checking her watch and glancing down the empty road. When a bicycle finally appeared in the distance, she let out a long breath, straightened her bag, and began to walk towards it, slowly, as though she did not want anyone to see how relieved she was.",
      question: "What impression do you get of how Mei Ling feels while she waits? Support it with two details and explain how they support your impression.",
      steps: [
        { label: "A · Gist", answer: "Mei Ling waits anxiously at the school gate after everyone has left, and she is relieved when someone cycles towards her.", think: "One sentence: who, what happened, and why. I left out small description." },
        { label: "B · Key detail", answer: "She “kept checking her watch”. This shows she was worried and impatient because the person she was waiting for was late.", think: "I picked an action, not a description of the road. Then I said what it shows." },
        { label: "C · Inference", answer: "I get the impression that Mei Ling is anxious. Firstly, she “kept checking her watch”, which suggests she is worried that the person is late. Also, she “let out a long breath” when the bicycle appears, which shows she had been tense until then.", think: "Impression first (one word: anxious). Two details that show the feeling. After each detail, “which suggests / shows…” gives the link." }
      ],
      marks: ["1 mark: a precise impression (anxious)", "1 mark: two relevant details from the text", "1 mark: each detail is linked to the impression"]
    },
    final: {
      title: "Whole story",
      prompt: "Summarise the whole story in 3–5 sentences (about 80–120 words) in your own words. Put the main events in order and say what the ending suggests.",
      criteria: ["Main events are in the right order", "Written in own words (not copied)", "The ending is included and explained"],
      tutorGuide: ["Check that every event is accurate and that no sentence is copied from the PDF.", "A strong summary names the ending as a suggestion, not a certainty."]
    }
  }
};

const GENERIC_GUIDE = [
  "Check each detail against the material. Accept any answer that the text supports.",
  "Marks: 1 inference stated precisely · 1 two relevant details · 1 explanation linking details to the inference."
];

let readingMaterialKey = "landlady";
let localReadingName = null;
let lastHighlightKey = "";

function wordCount(text) { return (text || "").trim().split(/\s+/).filter(Boolean).length; }

function activeLesson() {
  if (readingMaterialKey === "landlady" && !localReadingName) return lessons.landlady;
  const m = localReadingName ? null : materialLibrary[readingMaterialKey];
  return {
    key: "free", free: true,
    title: localReadingName || (m && m.title) || "Chosen material",
    segments: [{
      id: "free1", scaffold: "none", title: "Your chosen section",
      covers: "Choose a short range from the material. If the PDF is loaded here, select the section text and press “Set range from my selection”.",
      pages: "", start: "", end: "",
      gistPrompt: "In one complete sentence (about 20–35 words), explain what happens or what is explained in this section.",
      detailPrompt: "Choose ONE important detail from this section. Say what it is, then explain what it shows or why it matters.",
      inferencePrompt: (m && m.question) || "What can you infer from this section? Support your answer with two details and explain how they support it.",
      tutorGuide: GENERIC_GUIDE
    }]
  };
}

function lessonState(key) {
  state.reading ||= {};
  state.reading[key] ||= { segs: {}, ranges: {}, view: null };
  return state.reading[key];
}

function newSeg() {
  return {
    gist: "", detail: "", detailWhy: "", inference: "",
    checked: { A: false, B: false, C: false }, seenFirst: { A: false, B: false, C: false },
    selfA: "", selfB: "", selfC: [false, false, false],
    frameUsed: false, retry: "", retryGist: "",
    rv: { g: "", d: "", c: [false, false, false], note: "" },
    review: null, auto: null, autoRetry: null, attemptId: null, skillsApplied: false, saved: false, done: false
  };
}

function getSeg(rs, id) {
  const d = rs.segs[id] ||= newSeg();
  const base = newSeg();
  for (const k of Object.keys(base)) if (d[k] === undefined) d[k] = base[k];
  if (d.saved && !d.checked.C) d.checked = { A: true, B: true, C: true };
  return d;
}

function lessonIds(lesson) { return lesson.segments.map(s => s.id).concat(lesson.final ? ["final"] : []); }

function currentIndex(lesson, rs) {
  return lesson.segments.findIndex(s => !(rs.segs[s.id] && rs.segs[s.id].done));
}

function allowedMaxIndex(lesson, rs) {
  const ids = lessonIds(lesson);
  const cur = currentIndex(lesson, rs);
  return cur === -1 ? ids.length - 1 : cur;
}

function viewIdFor(lesson, rs) {
  const ids = lessonIds(lesson);
  const max = allowedMaxIndex(lesson, rs);
  let idx = ids.indexOf(rs.view);
  if (idx === -1 || idx > max) idx = max;
  return ids[idx];
}

function rangeOf(rs, seg) {
  const r = rs.ranges[seg.id] || {};
  return { pages: r.pages ?? seg.pages, start: r.start ?? seg.start, end: r.end ?? seg.end };
}

function rangeText(r) {
  if (!r.pages && !r.start && !r.end) return "";
  let t = r.pages || "Page ?";
  if (r.start) t += `, from “${r.start}”`;
  if (r.end) t += ` to “${r.end}”`;
  return t;
}

function scaffoldOf(seg) { return seg.scaffold || "none"; }

function anySeenFirst(d) { return d.seenFirst.A || d.seenFirst.B || d.seenFirst.C; }

function supportLabel(seg, d) {
  if (anySeenFirst(d)) return "Answer seen first";
  const sc = scaffoldOf(seg);
  if (sc === "full") return "Model + full sentence frame";
  if (sc === "frame" && d.frameUsed) return "Sentence frame on request";
  return "Independent first attempt";
}

function scaffoldChip(seg) {
  const sc = scaffoldOf(seg);
  if (sc === "full") return "Support: model + sentence frame";
  if (sc === "frame") return "Support: sentence frame on request";
  return "Support: independent";
}

/* ---------- rendering ---------- */

function renderReader() {
  const lesson = activeLesson();
  const rs = lessonState(lesson.key);
  rs.view = viewIdFor(lesson, rs);
  renderPills(lesson, rs);
  renderTask(lesson, rs);
  applyReaderPrefs();
  updateToolbar();
  renderTodayCard();
  applyHighlights(false);
}

function renderPills(lesson, rs) {
  const ids = lessonIds(lesson);
  const max = allowedMaxIndex(lesson, rs);
  document.querySelector("#seg-pills").innerHTML = ids.map((id, i) => {
    const isFinal = id === "final";
    const d = rs.segs[id];
    const done = !!(d && d.done);
    const locked = i > max;
    const label = done ? "✓" : isFinal ? "∑" : String(i + 1);
    const title = isFinal ? lesson.final.title : lesson.segments[i].title;
    const cls = ["seg-pill", done ? "done" : "", locked ? "locked" : "", id === rs.view ? "viewing" : ""].join(" ").trim();
    return `<li><button type="button" class="${cls}" data-act="goto" data-id="${id}" ${locked ? "disabled" : ""} title="${escapeHtml(title)}"><span>${label}</span><em>${escapeHtml(title)}</em></button></li>`;
  }).join("");
}

function renderTask(lesson, rs) {
  const pane = document.querySelector("#task-pane");
  const id = rs.view;
  if (id === "final") { pane.innerHTML = renderFinal(lesson, rs); bindCounters(pane); return; }
  const seg = lesson.segments.find(s => s.id === id);
  const n = lesson.segments.indexOf(seg);
  pane.innerHTML = renderSeg(lesson, rs, seg, n, getSeg(rs, id));
  bindCounters(pane);
}

function renderRangeCard(lesson, rs, seg, n, d) {
  const r = rangeOf(rs, seg);
  const text = rangeText(r);
  const total = lesson.segments.length;
  const head = lesson.free ? "YOUR SECTION" : `SECTION ${n + 1} OF ${total}`;
  const editable = !d.done;
  const mark = lesson.free ? "" : `<span class="range-marker">▶ ${n + 1}</span>`;
  return `
  <article class="range-card ${text ? "" : "unset"}">
    <div class="range-top"><span class="range-count">${head}</span>${editable ? `<button type="button" class="range-edit-btn" data-act="edit-range">Edit range</button>` : ""}</div>
    <h3>${mark}${escapeHtml(seg.title)}</h3>
    ${lesson.free ? "" : `<span class="support-chip">${scaffoldChip(seg)}</span>`}
    <p class="range-line"><strong>Read</strong> ${text ? escapeHtml(text) : "<span class=\"range-missing\">Range not set yet. Tap “Edit range”.</span>"}</p>
    <p class="range-cover">${escapeHtml(seg.covers)}</p>
    <p class="range-status" id="range-status"></p>
    <div class="range-edit hidden" id="range-edit">
      <p class="range-help">Easiest way: in the text, drag to select the whole section from its first word to its last word, then press the button.</p>
      <button type="button" class="range-pick" data-act="pick-range">Set range from my selection</button>
      <div class="range-fields">
        <div><label for="range-pages">Page(s)</label><input id="range-pages" value="${escapeHtml(r.pages)}" placeholder="Page 2" /></div>
        <div><label for="range-start">Starts at</label><input id="range-start" value="${escapeHtml(r.start)}" placeholder="First few words" /></div>
        <div><label for="range-end">Ends at</label><input id="range-end" value="${escapeHtml(r.end)}" placeholder="Last few words" /></div>
      </div>
      <button type="button" class="secondary-btn" data-act="save-range">Save range</button>
    </div>
    <p class="range-rule">Read only ${lesson.free ? "this range" : `from <b>▶ ${n + 1}</b> to <b>■ ${n + 1}</b>`}. The question is about these lines.</p>
  </article>`;
}

function stepCard(key, title, meta, body, extraClass = "") {
  return `<article class="step-card ${extraClass}" data-step="${key}"><div class="step-head"><span class="step-letter">${key}</span><h3>${title}</h3>${meta ? `<span class="step-meta">${meta}</span>` : ""}</div>${body}</article>`;
}

function counterHtml(field, text, range) {
  return `<span class="wc" data-count-for="${field}" data-min="${range[0]}" data-max="${range[1]}">${wordCount(text)} words · aim for ${range[0]}–${range[1]}</span>`;
}

function lockedAnswer(label, text) {
  return `<div class="locked-answer"><span>${label}</span><p>${text ? escapeHtml(text) : "<em>(left blank)</em>"}</p></div>`;
}

function demoBody(demo) {
  return `
    <p class="demo-passage">${escapeHtml(demo.passage)}</p>
    <p class="demo-q"><strong>Question:</strong> ${escapeHtml(demo.question)}</p>
    ${demo.steps.map(st => `<div class="demo-step"><span>${st.label}</span><p>${escapeHtml(st.answer)}</p><em>Thinking: ${escapeHtml(st.think)}</em></div>`).join("")}
    <ul class="demo-marks">${demo.marks.map(m => `<li>${escapeHtml(m)}</li>`).join("")}</ul>`;
}

function modelCard(lesson, rs, seg, key, id) {
  const m = seg.model;
  if (!m) return `<div class="model-card missing" ${id ? `id="${id}"` : ""}><span class="model-badge">NO MODEL ANSWER</span><p>There is no model answer for your own material. Compare your answer with your tutor.</p></div>`;
  const checked = !!(rs.modelsChecked && rs.modelsChecked[seg.id]);
  const draft = seg.modelDraft && !checked;
  let body = "";
  if (key === "A") body = m.gistBasic
    ? `<div class="model-part"><span>Full marks · simple words</span><p>${escapeHtml(m.gistBasic)}</p></div><div class="model-part"><span>High score · upgraded words</span><p>${escapeHtml(m.gist)}</p></div>`
    : `<p>${escapeHtml(m.gist)}</p>`;
  else if (key === "B") body = `<p>${escapeHtml(m.detail)}</p><p class="model-why">${escapeHtml(m.detailWhy)}</p>`;
  else body = m.parts.map(([label, text]) => `<div class="model-part"><span>${escapeHtml(label)}</span><p>${escapeHtml(text)}</p></div>`).join("");
  return `
  <div class="model-card ${draft ? "draft" : ""}" ${id ? `id="${id}"` : ""}>
    <span class="model-badge">MODEL ANSWER${draft ? " · DRAFT, TUTOR TO CHECK" : ""}</span>
    ${body}
    <em class="model-note">Other correct answers are possible. Compare the ideas, do not copy the words.</em>
    ${draft ? `<button type="button" class="text-btn model-ok" data-act="model-ok">Tutor: mark this model as checked</button>` : ""}
  </div>`;
}

function compareControls(key, d) {
  if (key === "C") {
    const labels = ["My impression matches the model’s idea.", "I used two details from the section.", "I explained how each detail supports my impression."];
    return `<div class="compare"><span>Check yourself (tick what is true)</span>${labels.map((l, i) => `<label><input type="checkbox" data-selfc="${i}" ${d.selfC[i] ? "checked" : ""} /> ${l}</label>`).join("")}</div>`;
  }
  const cur = key === "A" ? d.selfA : d.selfB;
  return `<div class="compare"><span>How close was your answer?</span><div class="chips">${[["2", "Matched"], ["1", "Close"], ["0", "Missed"]].map(([v, l]) => `<button type="button" class="chip ${cur === v ? "on" : ""}" data-act="self" data-k="${key}" data-v="${v}">${l}</button>`).join("")}</div></div>`;
}

function wordBank() { state.words ||= []; return state.words; }

function wordsCard(seg) {
  if (!seg.words || !seg.words.length) return "";
  const saved = seg.words.every(x => wordBank().some(b => b.w === x.w));
  return `<div class="words-card"><div class="words-top"><strong>Words to steal from this section</strong><span>These are from the school text. Use them in your own sentences.</span></div>
    <ul>${seg.words.map(x => `<li><b>${escapeHtml(x.w)}</b> <em>${escapeHtml(x.zh)}</em><span>${escapeHtml(x.plain)}</span><i>“${escapeHtml(x.say)}”</i></li>`).join("")}</ul>
    ${saved ? `<p class="words-saved">✓ Saved to your word bank. You will be asked to recall them tomorrow.</p>` : `<button type="button" class="secondary-btn" data-act="save-words">Save these words to my word bank</button>`}</div>`;
}

function dueWords(limit = 3) {
  const today = todayISO();
  return wordBank().filter(b => b.due <= today).slice(0, limit);
}

function recallCard() {
  const due = dueWords();
  if (!due.length) return "";
  return `<article class="recall-card"><div class="words-top"><strong>Quick word recall</strong><span>${wordBank().length} words in your bank. Type the English word for each meaning.</span></div>
    ${due.map(b => `<div class="recall-row" data-wid="${b.id}"><p>${escapeHtml(b.zh)} <em>${escapeHtml(b.plain)}</em></p><div class="recall-in"><input id="rc-${b.id}" type="text" autocomplete="off" placeholder="type the word" /><button type="button" class="secondary-btn" data-act="recall-check" data-id="${b.id}">Check</button></div></div>`).join("")}</article>`;
}

function recallCheck(id) {
  const b = wordBank().find(x => x.id === id);
  const input = document.querySelector(`#rc-${id}`);
  if (!b || !input) return;
  const norm = s => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const typed = norm(input.value), want = norm(b.w);
  if (!typed) return showToast("Type the word first.");
  const ok = typed === want || (typed.length >= 4 && want.startsWith(typed.slice(0, Math.max(4, want.length - 3))) && typed.startsWith(want.slice(0, Math.max(4, want.length - 3))));
  const steps = [1, 3, 7, 14];
  b.seen = (b.seen || 0) + 1;
  if (ok) { b.got = (b.got || 0) + 1; b.box = Math.min(3, (b.box || 0) + 1); b.due = plusDays(steps[b.box]); }
  else { b.box = 0; b.due = plusDays(1); }
  persist();
  const row = document.querySelector(`.recall-row[data-wid="${id}"]`);
  if (row) row.innerHTML = `<p class="${ok ? "rc-ok" : "rc-no"}">${ok ? "✓" : "✗"} <b>${escapeHtml(b.w)}</b> <em>${escapeHtml(b.zh)}</em></p><p class="rc-say">“${escapeHtml(b.say)}”</p>`;
  showToast(ok ? "Correct. You will see it again later." : "Not yet. You will see it again tomorrow.");
}

function saveWords() {
  const { seg } = currentCtx();
  if (!seg.words) return;
  const bank = wordBank();
  seg.words.forEach(x => { if (!bank.some(b => b.w === x.w)) bank.push({ id: crypto.randomUUID(), w: x.w, plain: x.plain, zh: x.zh, say: x.say, src: seg.title, box: 0, due: plusDays(1), seen: 0, got: 0 }); });
  persist(); renderReader(); showToast("Saved. You will be asked to recall them tomorrow.");
}

function remarkIfStale(seg, d, key) {
  const old = d.auto && d.auto[key];
  if (!old || old.v === Marking.version || !seg.rubric) return;
  const fresh = key === "A" ? Marking.markA(seg, d.gist) : key === "B" ? Marking.markB(seg, d.detail, d.detailWhy) : Marking.markC(seg, d.inference);
  fresh.v = Marking.version;
  fresh.prev = old.score;
  d.auto[key] = fresh;
  if (key === "A") { d.selfA = fresh.score ? "2" : "0"; d.rv.g = d.selfA; }
  if (key === "B") { d.selfB = fresh.score ? "2" : (fresh.points[0].got || fresh.points[1].got) ? "1" : "0"; d.rv.d = d.selfB; }
  if (key === "C") { d.selfC = fresh.points.map(p => p.got); d.rv.c = d.selfC.slice(); }
  persistSoon();
}

function typeChip(seg, key) {
  const t = seg.tags && seg.tags[key];
  return t ? `<span class="type-chip">School question type: ${escapeHtml(t)}</span>` : "";
}

function markCard(res, heading, sub) {
  if (!res) return "";
  const pts = res.points.map(p => `<li class="${p.got ? "ok" : "no"}"><b>${p.got ? "✓" : "✗"}</b><span>${escapeHtml(p.desc)}${p.got ? "" : `<em>${escapeHtml(p.feedback)}</em>`}</span></li>`).join("");
  const errs = res.errors.length ? `<ul class="mark-errors">${res.errors.map(e => `<li>${escapeHtml(e)}</li>`).join("")}</ul>` : "";
  const rem = res.prev !== undefined && res.prev !== res.score ? `<p class="mark-found">Re-marked with improved rules. Earlier estimate: ${res.prev} / ${res.max}.</p>` : "";
  const found = res.found && res.found.length ? `<p class="mark-found">Details I found: ${res.found.map(escapeHtml).join("; ")}</p>` : "";
  return `<div class="mark-card"><div class="mark-top"><strong>${escapeHtml(heading)}: ${res.score} / ${res.max}</strong><span>${escapeHtml(sub || "Estimated from keywords. It can be wrong. Correct it with your own check below.")}</span></div><ul class="mark-points">${pts}</ul>${found}${rem}${errs}</div>`;
}

function fixList(res) {
  if (!res) return "";
  const lost = res.points.filter(p => !p.got);
  if (!lost.length) return `<p class="fix-note">Your first attempt got every scoring point. Rewrite it to make it clearer and more precise.</p>`;
  return `<div class="fix-note"><b>Fix these points in your rewrite:</b><ul>${lost.map(p => `<li>${escapeHtml(p.desc)}: ${escapeHtml(p.feedback)}</li>`).join("")}</ul></div>`;
}

function renderStep(lesson, rs, seg, d, key) {
  const meta = STEP_META[key];
  const locked = d.checked[key];
  const modelId = `model-${key}`;
  if (locked) {
    let mine = "";
    if (key === "A") mine = lockedAnswer("Your answer", d.gist);
    if (key === "B") mine = lockedAnswer("Your answer", d.detail + (d.detailWhy ? "  —  " + d.detailWhy : ""));
    if (key === "C") mine = lockedAnswer("Your answer", d.inference);
    remarkIfStale(seg, d, key);
    const res = d.auto && d.auto[key];
    return stepCard(key, meta.title, meta.meta, `${typeChip(seg, key)}${mine}${markCard(res, "First attempt")}${modelCard(lesson, rs, seg, key, modelId)}${key === "A" ? wordsCard(seg) : ""}${compareControls(key, d)}`, key === "C" ? "focus-card" : "");
  }
  const seeLink = "";
  const early = typeChip(seg, key);
  const full = scaffoldOf(seg) === "full";
  let body = "";
  if (key === "A") {
    body = `${early}<label for="f-gist">${escapeHtml(seg.gistPrompt)}</label>
      <textarea id="f-gist" data-field="gist" rows="3" placeholder="${full ? "Who + did what + why or where." : "Write one complete sentence."}">${escapeHtml(d.gist)}</textarea>
      ${counterHtml("gist", d.gist, GIST_RANGE)}`;
  } else if (key === "B") {
    body = `${early}<p class="q-line">${escapeHtml(seg.detailPrompt)}</p>
      <label for="f-detail" class="sub-label">1. Copy the exact words from the text</label>
      <textarea id="f-detail" data-field="detail" rows="2" placeholder="“…”">${escapeHtml(d.detail)}</textarea>
      <label for="f-detailWhy" class="sub-label">2. What does it show? Explain in your own words</label>
      <textarea id="f-detailWhy" data-field="detailWhy" rows="2" placeholder="${full ? "This shows … because …" : "This shows…"}">${escapeHtml(d.detailWhy)}</textarea>`;
  } else {
    const frameText = seg.frame || "I get the impression that ______ because the text says “______”. This suggests ______. Also, “______” shows ______.";
    const frameBlock = full || d.frameUsed ? `<div class="frame-box"><span>Sentence frame</span><p>${escapeHtml(frameText)}</p><em>Use short quotations and your own words. Do not copy whole sentences.</em></div>` : "";
    const frameBtn = scaffoldOf(seg) === "frame" && !d.frameUsed ? `<button type="button" class="text-btn frame-btn" data-act="show-frame">Show the sentence frame</button>` : "";
    body = `${early}<label for="f-inference">${escapeHtml(seg.inferencePrompt)}</label>
      ${frameBlock}${frameBtn}
      <textarea id="f-inference" data-field="inference" rows="6" placeholder="Answer in 2–3 complete sentences. Do not copy whole sentences from the text.">${escapeHtml(d.inference)}</textarea>`;
  }
  return stepCard(key, meta.title, meta.meta, `${body}<div class="step-actions"><button type="button" class="primary-btn" data-act="check" data-k="${key}">Submit my answer <span>→</span></button><span class="submit-note">You will see your score and what you lost straight away. Your first score is kept.</span></div>`, key === "C" ? "focus-card" : "");
}

function reviewControls(seg, d) {
  const rv = d.rv;
  const sel = (field, val) => `<select data-rv="${field}"><option value="" ${val === "" ? "selected" : ""}>Choose…</option><option value="2" ${val === "2" ? "selected" : ""}>Secure</option><option value="1" ${val === "1" ? "selected" : ""}>Partly</option><option value="0" ${val === "0" ? "selected" : ""}>Not yet</option></select>`;
  const crit = ["Impression stated precisely", "Two relevant details from this section", "Explanation links the details to the impression"];
  return `
  <details class="tutor-review">
    <summary>Tutor review (optional) · mark the first attempt</summary>
    <div class="rv-grid">
      <div><label>A · Gist</label>${sel("g", rv.g)}</div>
      <div><label>B · Key detail</label>${sel("d", rv.d)}</div>
    </div>
    <label class="sub-label">C · Inference (tick what is present, 1 mark each)</label>
    <div class="answer-checks rv-checks">${crit.map((c, i) => `<label><input type="checkbox" data-rvcheck="${i}" ${rv.c[i] ? "checked" : ""} /> ${c}</label>`).join("")}</div>
    <label for="rv-note" class="sub-label">One strength and one next action (optional)</label>
    <textarea id="rv-note" data-rv="note" rows="2" placeholder="Strength… Next action…">${escapeHtml(rv.note)}</textarea>
    <details class="tutor-guide"><summary>Tutor guide for this section</summary><ul>${seg.tutorGuide.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul></details>
    <button type="button" class="secondary-btn" data-act="save-review">Save review</button>
  </details>`;
}

function reviewSummary(d) {
  const rv = d.review;
  return `
  <div class="review-done">
    <div><strong>${rv.source === "self" ? "Self-marked" : "Marked"}: ${rv.score} / 3</strong><span>${escapeHtml(rv.stepSummary)}</span></div>
    ${rv.note ? `<p>${escapeHtml(rv.note)}</p>` : ""}
    <p class="field-help">Main gap: ${escapeHtml(rv.gapLabel)}</p>
  </div>`;
}

function renderSeg(lesson, rs, seg, n, d) {
  const demo = lesson.demo;
  if (demo && !lesson.free && n === 0 && !rs.demoSeen && !d.checked.A) {
    return `
    ${renderRangeCard(lesson, rs, seg, n, d)}
    <article class="demo-card open">
      <div class="demo-head"><span class="demo-badge">STEP 0 · WATCH FIRST</span><h3>${escapeHtml(demo.title)}</h3></div>
      ${demoBody(demo)}
      <div class="form-actions"><p>Read the model slowly. It uses a different text, so it is not the answer to Section 1.</p><button type="button" class="primary-btn" data-act="demo-ok">I understand. Start Section 1 <span>→</span></button></div>
    </article>`;
  }
  const out = [renderRangeCard(lesson, rs, seg, n, d)];
  if (!lesson.free && !d.checked.A) { const rc = recallCard(); if (rc) out.push(rc); }
  if (demo && !lesson.free && scaffoldOf(seg) !== "none") out.push(`<details class="demo-card"><summary>Look at the model again (different text)</summary>${demoBody(demo)}</details>`);
  out.push(renderStep(lesson, rs, seg, d, "A"));
  if (d.checked.A) out.push(renderStep(lesson, rs, seg, d, "B"));
  if (d.checked.B) out.push(renderStep(lesson, rs, seg, d, "C"));
  if (d.checked.C) {
    const retryOk = wordCount(d.retry) >= 10;
    if (d.done) {
      out.push(stepCard("↻", "Improved answer", "", `${d.retryGist ? lockedAnswer("Gist (improved)", d.retryGist) : ""}${lockedAnswer("Inference (improved)", d.retry)}${d.auto && d.autoRetry ? `<p class="compare-line"><strong>First attempt ${d.auto.C.score} / 3 → Rewrite ${d.autoRetry.score} / 3</strong> <span>(the first score is kept as your diagnostic record)</span></p>` : ""}`));
      out.push(`<article class="panel">${d.review ? reviewSummary(d) : "<p class=\"field-help\">Not marked yet. Use the self-check above or ask a tutor.</p>"}</article>`);
      const hasNext = n + 1 < lesson.segments.length;
      const nextLabel = hasNext ? "Go to next section" : lesson.final ? "Go to whole-story summary" : "";
      out.push(`<div class="form-actions"><p>${lesson.free ? "Start a new section to practise again." : "This section is complete."}</p>${nextLabel ? `<button type="button" class="primary-btn" data-act="next">${nextLabel} <span>→</span></button>` : lesson.free ? `<button type="button" class="primary-btn" data-act="new-free">Start a new section <span>→</span></button>` : ""}</div>`);
    } else {
      out.push(stepCard("↻", "Rewrite the points you lost", "second attempt", `
        ${fixList(d.auto && d.auto.C)}
        <label for="f-retry">Rewrite your answer to C, fixing the lost points. Use your own words. Do not copy the model.</label>
        <textarea id="f-retry" data-field="retry" rows="5" placeholder="Rewrite your inference…">${escapeHtml(d.retry)}</textarea>
        <div class="step-actions"><button type="button" class="secondary-btn" data-act="check-retry">Check my rewrite</button></div>
        ${d.autoRetry ? markCard(d.autoRetry, "Rewrite", "Compare with your first attempt: " + (d.auto && d.auto.C ? d.auto.C.score : "?") + " / 3 → " + d.autoRetry.score + " / 3") : ""}
        <label for="f-retryGist" class="sub-label">Optional: improve your gist (A)</label>
        <textarea id="f-retryGist" data-field="retryGist" rows="2" placeholder="Rewrite the gist if you want to.">${escapeHtml(d.retryGist)}</textarea>`, "focus-card"));
      out.push(`<article class="panel">${d.review ? reviewSummary(d) + `<button type="button" class="text-btn" data-act="remark">Change the review</button>` : reviewControls(seg, d)}</article>`);
      out.push(`<div class="form-actions"><p id="finish-note">${retryOk ? "Ready. You can open the next section." : "Write at least 10 words in your retry to unlock the next section."}</p><button type="button" id="finish-btn" class="primary-btn" data-act="finish" ${retryOk ? "" : "disabled"}>${n + 1 < lesson.segments.length ? "Finish section and unlock next" : lesson.final ? "Finish section and unlock summary" : "Finish section"} <span>→</span></button></div>`);
    }
  }
  return out.join("\n");
}

function renderFinal(lesson, rs) {
  const f = lesson.final;
  const d = getSeg(rs, "final");
  const total = lesson.segments.length;
  if (d.done) {
    return `
    <article class="range-card"><div class="range-top"><span class="range-count">WHOLE STORY</span></div><h3>${escapeHtml(f.title)} summary</h3><p class="range-cover">Complete.</p></article>
    <article class="panel">${lockedAnswer("Your summary", d.inference)}${d.review ? reviewSummary(d) : "<p class=\"field-help\">Not marked yet.</p>"}</article>`;
  }
  const rv = d.rv;
  return `
  <article class="range-card">
    <div class="range-top"><span class="range-count">WHOLE STORY · ${total} SECTIONS DONE</span></div>
    <h3>${escapeHtml(f.title)}</h3>
    <p class="range-line"><strong>Task</strong> ${escapeHtml(f.prompt)}</p>
  </article>
  ${stepCard("∑", "Summary", "3–5 sentences", `
    <textarea id="f-inference" data-field="inference" rows="8" placeholder="First… Then… Finally…" ${d.saved ? "readonly" : ""}>${escapeHtml(d.inference)}</textarea>
    ${counterHtml("final", d.inference, FINAL_RANGE)}`, "focus-card")}
  ${d.saved ? `<article class="panel">${d.review ? reviewSummary(d) : `
    <details class="tutor-review" open><summary>Tutor review</summary>
      <div class="answer-checks rv-checks">${f.criteria.map((c, i) => `<label><input type="checkbox" data-rvcheck="${i}" ${rv.c[i] ? "checked" : ""} /> ${c}</label>`).join("")}</div>
      <label for="rv-note" class="sub-label">One strength and one next action (optional)</label>
      <textarea id="rv-note" data-rv="note" rows="2">${escapeHtml(rv.note)}</textarea>
      <details class="tutor-guide"><summary>Tutor guide</summary><ul>${f.tutorGuide.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul></details>
      <button type="button" class="secondary-btn" data-act="save-final-review">Save review</button>
    </details>`}</article>
  <div class="form-actions"><p>Complete the review to close the lesson.</p><button type="button" class="primary-btn" data-act="finish-final">Finish lesson <span>→</span></button></div>` :
  `<div class="form-actions"><p>Write in your own words. Do not copy sentences from the story.</p><button type="button" class="primary-btn" data-act="save-final">Save summary <span>→</span></button></div>`}`;
}

/* ---------- counters ---------- */

function bindCounters(root) {
  root.querySelectorAll(".wc").forEach(el => {
    const field = el.dataset.countFor;
    const ta = root.querySelector(field === "final" ? "#f-inference" : `#f-${field}`);
    if (ta) styleCounter(el, wordCount(ta.value));
  });
}

function styleCounter(el, n) {
  const min = Number(el.dataset.min), max = Number(el.dataset.max);
  el.textContent = `${n} words · aim for ${min}–${max}`;
  el.classList.toggle("ok", n >= min && n <= max);
  el.classList.toggle("warn", n > 0 && (n < min || n > max));
}

/* ---------- viewer surfaces, toolbar, highlighting ---------- */

function showReadingSurface(mode) {
  document.querySelector("#reading-material-frame").classList.toggle("hidden", mode !== "frame");
  document.querySelector("#reading-material-image").classList.toggle("hidden", mode !== "image");
  document.querySelector("#reading-material-text").classList.toggle("hidden", mode !== "text");
  document.querySelector("#pdf-container").classList.toggle("hidden", mode !== "pdf");
  document.querySelector("#reading-viewer").dataset.mode = mode;
  updateToolbar();
}

function readingMode() { return document.querySelector("#reading-viewer").dataset.mode || "frame"; }

function updateToolbar() {
  const lesson = activeLesson();
  const isLandlady = lesson.key === "landlady";
  const pdfShown = readingMode() === "pdf";
  const label = document.querySelector("#reading-file-text");
  if (label) label.textContent = isLandlady ? (PdfView.hasDoc() && PdfView.key() === "landlady" ? "Replace PDF" : "Load school PDF") : "Choose your own file";
  const banner = document.querySelector("#pdf-banner");
  if (banner) banner.classList.toggle("hidden", !(isLandlady && !pdfShown));
  document.querySelector("#pdf-remove").classList.toggle("hidden", !(isLandlady && pdfShown));
  document.querySelector("#zoom-ctl").classList.toggle("hidden", !pdfShown);
  document.querySelector("#zoom-label").textContent = Math.round(PdfView.getZoom() * 100) + "%";
}

function applyHighlights(forceScroll) {
  const status = document.querySelector("#range-status");
  const lesson = activeLesson();
  const rs = lessonState(lesson.key);
  const matches = PdfView.hasDoc() && (lesson.key === "landlady" ? PdfView.key() === "landlady" : PdfView.key() !== "landlady");
  if (readingMode() !== "pdf" || !matches) {
    if (status) status.textContent = lesson.key === "landlady" ? "Load the school PDF on the left to see this section highlighted in the text." : "";
    return;
  }
  if (!PdfView.ready()) { if (status) status.textContent = "Preparing the text…"; return; }
  const items = lesson.segments.map((s, i) => {
    const r = rangeOf(rs, s);
    return { id: s.id, label: lesson.free ? "" : String(i + 1), start: r.start, end: r.end, current: s.id === rs.view };
  }).filter(i => i.start);
  const result = PdfView.highlight(items);
  const cur = result[rs.view];
  const msgs = {
    ok: "Highlighted in the text: ▶ is where to start, ■ is where to stop.",
    "start-missing": "The first words were not found in the PDF. Press “Edit range” and set the range again.",
    "end-missing": "The last words were not found in the PDF. Press “Edit range” and set the range again.",
    "no-range": "This section’s range is not set. Press “Edit range”.",
    "no-index": "Preparing the text…"
  };
  if (status) status.textContent = cur ? msgs[cur] : (rs.view === "final" ? "" : msgs["no-range"]);
  const key = lesson.key + ":" + rs.view;
  if (cur === "ok" && (forceScroll || lastHighlightKey !== key)) { PdfView.scrollTo(rs.view); lastHighlightKey = key; }
}

async function loadReadingFile(file) {
  if (!file) return;
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  const forLandlady = readingMaterialKey === "landlady" && !localReadingName;
  const openLink = document.querySelector("#reading-open-source");
  if (isPdf && PdfView.available()) {
    let buf;
    try {
      buf = await file.arrayBuffer();
      await PdfView.load(buf, forLandlady ? "landlady" : "local:" + file.name);
    } catch { showToast("Could not open that PDF."); return; }
    if (forLandlady) {
      await PdfStore.put("landlady-pdf", { data: buf, name: file.name, savedAt: todayISO() });
      showToast("PDF opened and kept in this browser only.");
    } else {
      localReadingName = file.name;
      openLink.classList.add("hidden");
      document.querySelector("#reading-source-title").textContent = file.name;
      document.querySelector("#reading-source-subtitle").textContent = "Local study material";
      document.querySelector("#reading-source-note").innerHTML = "<strong>Local file:</strong> displayed only in this browser; it has not been uploaded to the site.";
      showToast(`${file.name} loaded.`);
    }
    showReadingSurface("pdf");
    lastHighlightKey = "";
    renderReader();
    return;
  }
  localReadingName = file.name;
  openLink.classList.add("hidden");
  if (localObjectUrls.reading) URL.revokeObjectURL(localObjectUrls.reading);
  if (file.type.startsWith("image/")) {
    localObjectUrls.reading = URL.createObjectURL(file);
    const img = document.querySelector("#reading-material-image");
    img.src = localObjectUrls.reading; img.alt = file.name;
    showReadingSurface("image");
  } else if (isPdf) {
    localObjectUrls.reading = URL.createObjectURL(file);
    document.querySelector("#reading-material-frame").src = localObjectUrls.reading;
    showReadingSurface("frame");
  } else {
    document.querySelector("#reading-material-text").textContent = await file.text();
    showReadingSurface("text");
  }
  document.querySelector("#reading-source-title").textContent = file.name;
  document.querySelector("#reading-source-subtitle").textContent = "Local study material";
  document.querySelector("#reading-source-note").innerHTML = "<strong>Local file:</strong> displayed only in this browser; it has not been uploaded to the site.";
  showToast(`${file.name} loaded.`);
  renderReader();
}

async function restoreLandladyPdf() {
  if (!PdfView.available()) return false;
  const rec = await PdfStore.get("landlady-pdf");
  if (!rec || !rec.data) return false;
  try {
    await PdfView.load(rec.data, "landlady");
    if (readingMaterialKey === "landlady" && !localReadingName) { showReadingSurface("pdf"); lastHighlightKey = ""; renderReader(); }
    return true;
  } catch { return false; }
}

async function removeLandladyPdf() {
  await PdfStore.del("landlady-pdf");
  PdfView.clear();
  showReadingSurface("frame");
  renderReader();
  showToast("Saved PDF removed from this browser.");
}

/* ---------- preferences: focus mode, hide text, panel width ---------- */

function applyReaderPrefs() {
  const prefs = state.prefs || {};
  const readingActive = document.querySelector("#view-reading").classList.contains("active");
  document.body.classList.toggle("focus-mode", !!prefs.focus && readingActive);
  if (!(prefs.focus && readingActive)) document.body.classList.remove("nav-open");
  document.querySelector("#reader").classList.toggle("hide-text", !!prefs.hideText);
  const t = document.querySelector("#toggle-text"), f = document.querySelector("#toggle-focus");
  t.textContent = prefs.hideText ? "Show text" : "Hide text";
  t.setAttribute("aria-pressed", String(!!prefs.hideText));
  f.textContent = prefs.focus ? "Exit focus (Esc)" : "Focus mode";
  f.setAttribute("aria-pressed", String(!!prefs.focus));
  const grid = document.querySelector("#reader-grid");
  if (prefs.taskW) grid.style.setProperty("--task-w", prefs.taskW + "px"); else grid.style.removeProperty("--task-w");
}

function renderTodayCard() {
  const lesson = lessons.landlady;
  const rs = lessonState("landlady");
  const cur = currentIndex(lesson, rs);
  const objective = document.querySelector("#today-objective");
  const btn = document.querySelector("#today-reading-btn");
  if (!objective || !btn) return;
  if (cur === -1) {
    const fin = rs.segs.final && rs.segs.final.done;
    objective.textContent = fin ? "The Landlady is complete. Review your answers or choose another text." : "All five sections are done. Next: write the whole-story summary.";
    btn.firstChild.textContent = fin ? "Review The Landlady " : "Write the summary ";
  } else {
    objective.textContent = `Section ${cur + 1} of ${lesson.segments.length}: ${lesson.segments[cur].title}. Read one short range, then answer three small questions: gist, key detail, inference.`;
    btn.firstChild.textContent = cur === 0 ? "Begin guided reading " : "Continue guided reading ";
  }
}

/* ---------- actions ---------- */

function scrollToEl(el) {
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function scrollTaskTop() {
  const pane = document.querySelector("#task-pane");
  if (document.body.classList.contains("focus-mode")) pane.scrollTo({ top: 0 });
  else pane.scrollIntoView({ behavior: "smooth", block: "start" });
}

function currentCtx() {
  const lesson = activeLesson();
  const rs = lessonState(lesson.key);
  const id = rs.view;
  const seg = lesson.segments.find(s => s.id === id);
  return { lesson, rs, id, seg, d: getSeg(rs, id) };
}

function checkStep(key) {
  const { seg, d } = currentCtx();
  if (key === "A" && wordCount(d.gist) < 8) return showToast("Write your gist as a complete sentence first (at least 8 words).");
  if (key === "B" && (!d.detail.trim() || !d.detailWhy.trim())) return showToast("Fill in both parts of the key detail.");
  if (key === "C" && wordCount(d.inference) < 15) return showToast("Write your inference in 2–3 sentences first.");
  d.checked[key] = true;
  d.auto ||= {};
  if (!d.auto[key]) {
    d.auto[key] = key === "A" ? Marking.markA(seg, d.gist) : key === "B" ? Marking.markB(seg, d.detail, d.detailWhy) : Marking.markC(seg, d.inference);
    const a = d.auto[key];
    a.v = Marking.version;
    if (key === "A") { d.selfA = a.score ? "2" : "0"; d.rv.g = d.selfA; }
    if (key === "B") { const rel = a.points[0].got, fn = a.points[1].got; d.selfB = a.score ? "2" : (rel || fn) ? "1" : "0"; d.rv.d = d.selfB; }
    if (key === "C") { d.selfC = a.points.map(p => p.got); d.rv.c = a.points.map(p => p.got); }
  }
  if (key === "C") { d.saved = true; d.savedAt = todayISO(); }
  persist(); renderReader();
  setTimeout(() => scrollToEl(document.querySelector(`#model-${key}`)), 60);
  showToast(d.auto && d.auto[key] ? `First attempt: ${d.auto[key].score} / ${d.auto[key].max}. See what you gained and lost below.` : "Answer saved.");
}

function computeReview(d) {
  const rv = d.rv;
  const g = rv.g === "" ? 1 : Number(rv.g);
  const dt = rv.d === "" ? 1 : Number(rv.d);
  const score = rv.c.filter(Boolean).length;
  const names = ["not yet", "partly", "secure"];
  let skillId = "inference", gapLabel = "Secure: next check is a changed-context item";
  if (g === 0) { skillId = "literal"; gapLabel = "Literal comprehension"; }
  else if (!rv.c[0]) { skillId = "inference"; gapLabel = "Inference"; }
  else if (!rv.c[1] || dt === 0) { skillId = "evidence-selection"; gapLabel = "Evidence selection"; }
  else if (!rv.c[2]) { skillId = "reasoning-link"; gapLabel = "Reasoning link"; }
  else if (g === 1 || dt === 1) { skillId = g === 1 ? "literal" : "evidence-selection"; gapLabel = g === 1 ? "Literal comprehension" : "Evidence selection"; }
  return { g, dt, score, stepSummary: `Gist ${names[g]} · Detail ${names[dt]} · Inference ${score}/3`, skillId, gapLabel, note: rv.note.trim() };
}

function saveReview(source) {
  const { lesson, rs, seg, d } = currentCtx();
  if (source === "tutor" && (d.rv.g === "" || d.rv.d === "")) return showToast("Rate the gist and the key detail first.");
  const r = computeReview(d);
  const skill = state.skills.find(s => s.id === r.skillId) || state.skills.find(s => s.id === "inference");
  const n = lesson.segments.indexOf(seg) + 1;
  const support = supportLabel(seg, d) + (source === "self" ? " · self-marked" : "");
  const record = {
    id: d.attemptId || crypto.randomUUID(), date: todayISO(),
    type: `Guided reading · ${lesson.title}${lesson.free ? "" : " §" + n}`,
    pages: rangeText(rangeOf(rs, seg)), gist: d.gist, detail: d.detail, detailWhy: d.detailWhy, firstAnswer: d.inference, retry: d.retry,
    score: r.score, max: 3, scoreLabel: `${r.score} / 3`, skillId: skill.id, skillLabel: skill.label, gapLabel: r.gapLabel,
    support, stepSummary: r.stepSummary
  };
  const at = state.attempts.findIndex(a => a.id === record.id);
  if (at >= 0) state.attempts[at] = record; else state.attempts.push(record);
  d.attemptId = record.id;
  if (!d.skillsApplied) {
    const supported = !support.startsWith("Independent") || source === "self";
    updateSkill("literal", r.g * 50, supported);
    updateSkill("evidence-selection", ((r.dt * 50) + (d.rv.c[1] ? 100 : 0)) / 2, supported);
    updateSkill("inference", d.rv.c[0] ? 100 : 0, supported);
    updateSkill("reasoning-link", d.rv.c[2] ? 100 : 0, supported);
    state.reviews.push({ id: crypto.randomUUID(), skillId: skill.id, skillLabel: skill.label, due: plusDays(r.score === 3 && r.g === 2 && r.dt === 2 ? 7 : 2), task: "Changed-context inference item", complete: false });
    d.skillsApplied = true;
  }
  d.review = { score: r.score, stepSummary: r.stepSummary, gapLabel: r.gapLabel, note: r.note, source };
  saveState(); renderReader();
  if (source === "tutor") showToast("Review saved to the progress log.");
}

function finishSection() {
  const ctx = currentCtx();
  const { lesson, rs, seg, d } = ctx;
  if (wordCount(d.retry) < 10) return showToast("Write your retry first.");
  if (!d.autoRetry && seg.rubric) d.autoRetry = Marking.markC(seg, d.retry);
  const selfMarked = d.selfA !== "" || d.selfB !== "" || d.selfC.some(Boolean);
  if (!d.review && selfMarked) saveReview("self");
  d.done = true;
  const n = lesson.segments.indexOf(seg);
  if (!lesson.free) rs.view = n + 1 < lesson.segments.length ? lesson.segments[n + 1].id : "final";
  saveState(); renderReader(); scrollTaskTop();
  showToast(lesson.free ? "Section complete." : "Section complete. The next one is open.");
}

function saveFinal() {
  const { d } = currentCtx();
  if (wordCount(d.inference) < 40) return showToast("Write a fuller summary first (3–5 sentences).");
  d.saved = true;
  persist(); renderReader(); scrollTaskTop();
  showToast("Summary saved. Review it, then finish the lesson.");
}

function saveFinalReview() {
  const { lesson, d } = currentCtx();
  const score = d.rv.c.filter(Boolean).length;
  const skill = state.skills.find(s => s.id === "summary");
  const record = {
    id: crypto.randomUUID(), date: todayISO(), type: `Guided reading · ${lesson.title} summary`, pages: "Whole story",
    firstAnswer: d.inference, score, max: 3, scoreLabel: `${score} / 3`, skillId: "summary", skillLabel: skill.label,
    gapLabel: score === 3 ? "Secure: next check is an unseen text" : !d.rv.c[0] ? "Sequencing" : !d.rv.c[1] ? "Own words" : "Ending and significance",
    support: "Independent first attempt", stepSummary: `Summary ${score}/3`
  };
  state.attempts.push(record);
  updateSkill("summary", (score / 3) * 100, false);
  state.reviews.push({ id: crypto.randomUUID(), skillId: "summary", skillLabel: skill.label, due: plusDays(score === 3 ? 7 : 3), task: "Summary of an unseen short story", complete: false });
  d.review = { score, stepSummary: record.stepSummary, gapLabel: record.gapLabel, note: d.rv.note.trim(), source: "tutor" };
  saveState(); renderReader();
  showToast("Review saved to the progress log.");
}

function finishFinal() {
  const { d } = currentCtx();
  if (!d.review) return showToast("Save the review first.");
  d.done = true; saveState(); renderReader();
  showToast("The Landlady lesson is complete.");
}

function newFreeSection() {
  const rs = lessonState("free");
  rs.segs = {}; rs.ranges = {}; rs.view = null;
  persist(); renderReader(); scrollTaskTop();
}

function pickRangeFromSelection() {
  const info = PdfView.selectionInfo();
  if (!info) return showToast("First select the section text in the PDF on the left.");
  const words = info.text.split(/\s+/);
  if (words.length < 3) return showToast("Select more of the section text (at least a few words).");
  const take = Math.min(6, Math.max(2, Math.floor(words.length / 2)));
  const start = words.slice(0, take).join(" ");
  const end = words.slice(-take).join(" ");
  document.querySelector("#range-start").value = start;
  document.querySelector("#range-end").value = end;
  document.querySelector("#range-pages").value = info.p1 === info.p2 ? `Page ${info.p1}` : `Pages ${info.p1}–${info.p2}`;
  showToast("Range filled in. Press “Save range”.");
}

/* ---------- event wiring ---------- */

function initReader() {
  const pane = document.querySelector("#task-pane");
  PdfView.init(document.querySelector("#pdf-container"));
  PdfView.onRendered(() => { lastHighlightKey = ""; applyHighlights(true); updateToolbar(); });

  pane.addEventListener("input", e => {
    const t = e.target;
    const { id, d } = currentCtx();
    if (t.dataset.field) {
      d[t.dataset.field] = t.value;
      const counter = pane.querySelector(`[data-count-for="${t.dataset.field === "inference" && id === "final" ? "final" : t.dataset.field}"]`);
      if (counter) styleCounter(counter, wordCount(t.value));
      if (t.dataset.field === "retry") {
        const ok = wordCount(t.value) >= 10;
        const btn = pane.querySelector("#finish-btn"); if (btn) btn.disabled = !ok;
        const note = pane.querySelector("#finish-note");
        if (note) note.textContent = ok ? "Ready. You can open the next section." : "Write at least 10 words in your retry to unlock the next section.";
      }
      persistSoon();
    } else if (t.dataset.rv) {
      d.rv[t.dataset.rv] = t.value; persistSoon();
    }
  });

  pane.addEventListener("change", e => {
    const t = e.target;
    const { d } = currentCtx();
    if (t.dataset.selfc !== undefined) { const i = Number(t.dataset.selfc); d.selfC[i] = t.checked; d.rv.c[i] = t.checked; persistSoon(); }
    if (t.dataset.rvcheck !== undefined) { d.rv.c[Number(t.dataset.rvcheck)] = t.checked; persistSoon(); }
    if (t.dataset.rv && t.tagName === "SELECT") { d.rv[t.dataset.rv] = t.value; persistSoon(); }
  });

  pane.addEventListener("mousedown", e => { if (e.target.closest("[data-act=pick-range]")) e.preventDefault(); });

  document.querySelector("#reader").addEventListener("click", e => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    const ctx = currentCtx();
    if (act === "goto") { ctx.rs.view = btn.dataset.id; persist(); renderReader(); scrollTaskTop(); }
    else if (act === "edit-range") pane.querySelector("#range-edit").classList.toggle("hidden");
    else if (act === "pick-range") pickRangeFromSelection();
    else if (act === "save-range") {
      ctx.rs.ranges[ctx.seg.id] = { pages: pane.querySelector("#range-pages").value.trim(), start: pane.querySelector("#range-start").value.trim(), end: pane.querySelector("#range-end").value.trim() };
      lastHighlightKey = ""; persist(); renderReader(); showToast("Reading range saved.");
    }
    else if (act === "demo-ok") { ctx.rs.demoSeen = true; persist(); renderReader(); scrollTaskTop(); }
    else if (act === "show-frame") { ctx.d.frameUsed = true; persist(); renderReader(); }
    else if (act === "see-first") { ctx.d.seenFirst[btn.dataset.k] = true; persist(); renderReader(); setTimeout(() => scrollToEl(document.querySelector(`#model-${btn.dataset.k}`)), 60); }
    else if (act === "save-words") saveWords();
    else if (act === "recall-check") recallCheck(btn.dataset.id);
    else if (act === "check") checkStep(btn.dataset.k);
    else if (act === "check-retry") {
      if (wordCount(ctx.d.retry) < 10) return showToast("Write your rewrite first (at least 10 words).");
      ctx.d.autoRetry = Marking.markC(ctx.seg, ctx.d.retry);
      persist(); renderReader();
      showToast(`Rewrite: ${ctx.d.autoRetry.score} / 3 (first attempt ${ctx.d.auto ? ctx.d.auto.C.score : "?"} / 3).`);
    }
    else if (act === "self") {
      const k = btn.dataset.k, v = btn.dataset.v;
      if (k === "A") { ctx.d.selfA = v; ctx.d.rv.g = v; } else { ctx.d.selfB = v; ctx.d.rv.d = v; }
      btn.parentElement.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c === btn));
      persistSoon();
    }
    else if (act === "model-ok") { ctx.rs.modelsChecked ||= {}; ctx.rs.modelsChecked[ctx.seg.id] = true; persist(); renderReader(); }
    else if (act === "save-review") saveReview("tutor");
    else if (act === "remark") { ctx.d.review = null; persist(); renderReader(); }
    else if (act === "finish") finishSection();
    else if (act === "next") { const ids = lessonIds(ctx.lesson); ctx.rs.view = ids[ids.indexOf(ctx.id) + 1]; persist(); renderReader(); scrollTaskTop(); }
    else if (act === "new-free") newFreeSection();
    else if (act === "save-final") saveFinal();
    else if (act === "save-final-review") saveFinalReview();
    else if (act === "finish-final") finishFinal();
    else if (act === "zoom-in") { PdfView.setZoom(PdfView.getZoom() + 0.15); }
    else if (act === "zoom-out") { PdfView.setZoom(PdfView.getZoom() - 0.15); }
    else if (act === "remove-pdf") removeLandladyPdf();
  });

  document.querySelector("#toggle-text").addEventListener("click", () => { state.prefs.hideText = !state.prefs.hideText; persist(); applyReaderPrefs(); });
  document.querySelector("#toggle-focus").addEventListener("click", () => { state.prefs.focus = !state.prefs.focus; persist(); applyReaderPrefs(); });
  document.querySelector("#menu-fab").addEventListener("click", () => document.body.classList.toggle("nav-open"));
  document.querySelector("#nav-backdrop").addEventListener("click", () => document.body.classList.remove("nav-open"));
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (document.body.classList.contains("nav-open")) { document.body.classList.remove("nav-open"); return; }
    if (document.body.classList.contains("focus-mode")) { state.prefs.focus = false; persist(); applyReaderPrefs(); }
  });

  // Draggable divider between the text and the questions
  const splitter = document.querySelector("#splitter");
  const grid = document.querySelector("#reader-grid");
  splitter.addEventListener("pointerdown", e => {
    e.preventDefault();
    splitter.setPointerCapture(e.pointerId);
    document.body.classList.add("dragging");
    const move = ev => {
      const rect = grid.getBoundingClientRect();
      const w = Math.max(300, Math.min(760, rect.right - ev.clientX - 6));
      state.prefs.taskW = Math.round(w);
      grid.style.setProperty("--task-w", state.prefs.taskW + "px");
    };
    const up = () => {
      splitter.removeEventListener("pointermove", move);
      splitter.removeEventListener("pointerup", up);
      document.body.classList.remove("dragging");
      persist();
    };
    splitter.addEventListener("pointermove", move);
    splitter.addEventListener("pointerup", up);
  });
  splitter.addEventListener("dblclick", () => { state.prefs.taskW = null; persist(); applyReaderPrefs(); });

  restoreLandladyPdf();
}
