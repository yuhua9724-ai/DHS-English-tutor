/* DHS English Studio — rule-based first-pass marking (no server, no AI).
   Each step is checked against a small rubric: keyword groups, link words and common-error patterns.
   The result is an ESTIMATE: it tells the student which scoring points seem present or missing,
   and the student or tutor can correct it. The first attempt's result is stored and never overwritten. */

const Marking = (() => {
  const words = t => (String(t || "").trim().match(/\S+/g) || []);
  const rx = (src, flags = "i") => new RegExp(src, flags);
  const META = /(\bi\s*(do\s*n'?o?t?|dont|can'?t|cannot)\s*(know|understand|get)|\bi(?:'m| am)? not sure|no idea|\bidk\b|give up)/i;
  const LINK = /\b(suggests?|suggesting|shows?|showing|implies|implying|means|makes (him|her|the reader|readers|us|it)|because|so that|reveals?|hints?|proves?|indicates?|reminds?|tells? us)\b/gi;

  const pt = (id, desc, got, feedback) => ({ id, desc, got, feedback: got ? "" : feedback });

  function copiedRun(text, n) {
    try { return typeof PdfView !== "undefined" && PdfView.ready() ? PdfView.longestRun(text, n) : ""; } catch { return ""; }
  }

  function finish(max, points, errors, note) {
    const score = points.filter(p => p.got).length;
    return { max, score: Math.min(max, score), points, errors, note: note || "" };
  }

  /* A · Gist (1 mark): needs BOTH the "who + what" part and the section's key result */
  function markA(seg, text) {
    const r = (seg.rubric && seg.rubric.A) || {};
    const t = String(text || "");
    const errors = [];
    if (META.test(t)) errors.push("You are writing about your difficulty instead of answering. Start with: In this section, Billy …");
    const wc = words(t).length;
    if (wc < (r.minWords || 12)) errors.push("Your sentence is too short or too general. It does not fully explain what happens in this section.");
    if (r.outOfRange && rx(r.outOfRange).test(t)) errors.push(r.outOfRangeMsg || "You included information from a later part of the story. Stay inside this section.");
    const hit = (r.groups || []).filter(g => rx(g).test(t)).length;
    const whoOk = hit >= (r.need || 2);
    const resultOk = r.core ? rx(r.core).test(t) : true;
    const copy = copiedRun(t, 9);
    if (copy) errors.push(`You copied a long run from the text (“${copy}…”). Say it in your own words.`);
    const points = [
      pt("who_what", "Says who + what he is doing", whoOk, "Say who the section is about and what he is doing."),
      pt("result", "Reaches the key result of the whole section (not only the beginning)", resultOk, r.missing || "Your sentence stops too early. Add what happens at the END of the section.")
    ];
    const score = whoOk && resultOk && !errors.length ? 1 : 0;
    return { max: 1, score, points, errors, note: "" };
  }

  /* B · Key detail (1 mark: a relevant detail AND its function, in own words) */
  function markB(seg, detail, why) {
    const r = (seg.rubric && seg.rubric.B) || {};
    const d = String(detail || ""), w = String(why || "");
    const all = d + " " + w;
    const errors = [];
    if (META.test(all)) errors.push("You are writing about your difficulty instead of answering. Pick one thing from the section and say what it shows.");
    const relevant = r.relevant ? rx(r.relevant).test(all) : words(d).length >= 3;
    const hasFn = words(w).length >= 5 && (r.function ? rx(r.function).test(w) : /(show|suggest|because|so|make|mean|feel|why|seem|look)/i.test(w));
    const copy = copiedRun(r.allowQuote ? w : all, 7);
    const own = !copy;
    if (!relevant) errors.push(r.irrelevant || "This detail is not the most important one in the section. Look for what drives the action or the mood.");
    if (!hasFn) errors.push("You mentioned a detail but did not explain why it matters. Add: This shows … / This makes Billy …");
    if (copy) errors.push(`You copied too closely from the text (“${copy}…”). Rephrase the detail in your own words.`);
    const points = [
      pt("relevant", "Chooses a detail that really drives the action or the mood", relevant, r.irrelevant || "Choose a detail that drives the action or the mood."),
      pt("function", "Explains what the detail shows or why it matters", hasFn, "Add what the detail shows or why it matters."),
      pt("own", "Uses own words (not copied)", own, "Rephrase it in your own words.")
    ];
    const score = relevant && hasFn && own ? 1 : 0;
    return { max: 1, score, points, errors, note: "" };
  }

  /* C · Inference (3 marks) */
  function markC(seg, text) {
    const r = (seg.rubric && seg.rubric.C) || {};
    const t = String(text || "");
    const errors = [];
    if (META.test(t) && words(t).length < 25) errors.push("You are writing about your difficulty instead of answering. First give an impression: Billy seems ______.");
    const ideaOk = r.ideas ? rx(r.ideas).test(t) : false;
    const found = (r.details || []).filter(d => rx(d.re).test(t));
    const detailOk = found.length >= 2;
    const links = (t.match(LINK) || []).length;
    const linkOk = detailOk && links >= 2;
    const copy = copiedRun(t, 14);
    if (copy) errors.push(`A long stretch is copied from the text (“${copy}…”). Use short quotations and explain them.`);
    const points = [
      pt("impression", "States a precise impression", ideaOk, r.feedbackIdea || "You have not given a clear, precise impression yet. Start with: Billy seems ______."),
      pt("details", "Uses two relevant details from THIS section", detailOk, r.feedbackDetails || "You need two specific details from this section."),
      pt("link", "Explains how each detail supports the impression", linkOk, "After each detail add “This suggests …” or “This shows that …”.")
    ];
    if (found.length === 1) points[1].feedback = `Only one relevant detail found (${found[0].label}). Add a second one.`;
    if (found.length === 0 && ideaOk) points[1].feedback = (r.feedbackDetails || "You gave an impression but no specific detail from this section.");
    if (detailOk && !linkOk) errors.push("You have details, but you have not explained how each one creates the impression.");
    return { max: 3, score: points.filter(p => p.got).length, points, errors, found: found.map(f => f.label) };
  }

  return { markA, markB, markC, words, version: "1.4.1" };
})();
