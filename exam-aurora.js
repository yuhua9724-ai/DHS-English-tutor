/* DHS English Studio — real-paper lesson: DHS Y1 DHP WA3 2024, Paper 2 Text 4 (aurora), Section C [25].
   Marking rules follow the school's official answer key (must-have ideas, DNA = "do not accept", IYOW = in your own words).
   The passage itself is NOT in this file: the student opens her own copy of the Insert PDF. */

const EXAM_AURORA = (() => {
  const T = s => String(s || "");
  const has = (t, re) => re.test(t);
  const pt = (id, desc, got, fix) => ({ id, desc, got: !!got, feedback: got ? "" : fix });
  const res = (max, points, errors, note) => {
    const score = Math.min(max, points.filter(p => p.got).length);
    return { max, points, errors: errors || [], score, note: note || "" };
  };

  /* spelling-tolerant keyword check: finds the word even if it is slightly misspelt */
  const lev = (a, b) => { const m = a.length, n = b.length; const d = Array.from({ length: m + 1 }, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; };
  const nearWord = (t, w) => { const tol = w.length >= 8 ? 2 : 1; return String(t || "").toLowerCase().match(/[a-z]+/g)?.find(x => x === w || (Math.abs(x.length - w.length) <= tol && lev(x, w) <= tol)) || ""; };
  const spell = (t, w, errs) => { const f = nearWord(t, w); if (f && f !== w) errs.push(`Spelling: write “${w}” (you wrote “${f}”). Your idea is right, but this paper says spelling mistakes may be penalised, so check key words carefully.`); return !!f; };

  const questions = [
    {
      id: "q1", no: "1", marks: 1, tag: "C4", kind: "Literal · lift",
      stem: "According to paragraph 1, what does “this remarkable spectacle” refer to?",
      strategy: "Find what the phrase points back to (the words just before it). Lift the exact words — do not shorten them to one word.",
      model: "“mesmerising light dances (across the night sky)”",
      why: "The key idea is the mesmerising light dances. Writing only “the aurora” names the thing but loses the idea.",
      mark(a) {
        const t = T(a);
        const errs = [];
        const hasM = spell(t, "mesmerising", errs) || has(t, /mesmeri[sz]ing/i), hasD = has(t, /light\s+danc/i);
        if (!hasM && !hasD && has(t, /aurora|northern lights|phenomenon/i)) errs.push("Official note: writing only “aurora” does not capture the idea of “mesmerising”.");
        return res(1, [pt("idea", "Lifts “mesmerising light dances”", hasM && hasD, "Copy the whole phrase from paragraph 1: the mesmerising light dances (across the night sky).")], errs);
      }
    },
    {
      id: "q2", no: "2", marks: 1, tag: "C1", kind: "Literal · cause",
      stem: "According to paragraph 1, what causes the aurora?",
      strategy: "A ‘cause’ question: look for the word that links two things (interaction / results from).",
      model: "It is caused by the interaction between solar particles and Earth’s atmosphere.",
      why: "All three parts are needed: interaction + solar particles + Earth’s atmosphere.",
      mark(a) {
        const t = T(a);
        const i = has(t, /interact/i) || !!nearWord(t, "interaction"), s = has(t, /solar\s+particle/i), e = has(t, /earth|atmosphere/i);
        const errs = [];
        if ((s || e) && !i) errs.push("Official note: “solar particles” or “Earth’s atmosphere” alone is not accepted. The interaction between them is the important part.");
        const r = res(1, [
          pt("inter", "Says there is an interaction", i, "Say that the two things interact (the interaction between …)."),
          pt("solar", "Names solar particles", s, "Name the first thing: solar particles."),
          pt("earth", "Names Earth’s atmosphere", e, "Name the second thing: Earth’s atmosphere.")
        ], errs);
        r.score = i && s && e ? 1 : 0;
        return r;
      }
    },
    {
      id: "q3a", no: "3(a)", marks: 1, tag: "C1", kind: "Literal · both parts",
      stem: "According to paragraph 2, how did Galileo decide on the name “aurora borealis”?",
      strategy: "‘How did he decide’ = what the name was based on. The mark scheme needs BOTH parts.",
      model: "He based the name on Aurora, the Roman goddess of dawn, and Boreas, the Greek god of the north wind.",
      why: "Both parts are required: Aurora AND Boreas.",
      mark(a) {
        const t = T(a).replace(/aurora\s+borealis/gi, " ");
        const au = has(t, /aurora/i), bo = has(t, /boreas/i) || !!nearWord(t, "boreas");
        const r = res(1, [
          pt("aurora", "Aurora (goddess of dawn)", au, "Add the first source of the name: Aurora, the Roman goddess of dawn."),
          pt("boreas", "Boreas (god of the north wind)", bo, "Add the second source of the name: Boreas, the Greek god of the north wind.")
        ], []);
        r.score = au && bo ? 1 : 0;
        return r;
      }
    },
    {
      id: "q3b", no: "3(b)", marks: 1, tag: "C1", kind: "Literal · one example",
      stem: "Name one other instance where auroras are mentioned in the past.",
      strategy: "‘Other’ means not Galileo. Give ONE instance, with who and when.",
      model: "A royal astronomer (under Babylon’s King Nebuchadnezzar II) documented the phenomenon on a tablet dated to 567 B.C.  OR  A Chinese report from 193 B.C. also noted the existence of the aurora.",
      why: "Either instance is accepted. “Chinese” must start with a capital C.",
      mark(a) {
        const t = T(a);
        const errs = [];
        const babylon = has(t, /astronomer|nebuchadnezzar|babylon|tablet|567/i);
        const chinaWord = has(t, /chinese|china/i), chinaCap = has(t, /Chinese|China/), has193 = has(t, /193/);
        const chinese = (chinaWord || has193) && (chinaCap || has193 && !chinaWord);
        if (chinaWord && !chinaCap && !babylon) errs.push("Official note: the first letter of Chinese must be a capital letter.");
        const ok = babylon || chinese;
        const r = res(1, [pt("inst", "Gives one instance (Babylonian tablet 567 B.C. or Chinese report 193 B.C.)", ok, "Give one instance from paragraph 2: the royal astronomer’s tablet (567 B.C.) or the Chinese report (193 B.C.).")], errs);
        r.score = ok ? 1 : 0;
        return r;
      }
    },
    {
      id: "q4", no: "4", marks: 2, tag: "", kind: "Own words · contrast",
      stem: "According to paragraph 2, what is interesting about the name of the aurora borealis? Answer in your own words.",
      strategy: "‘Interesting’ points to a contrast (even though …). Find the sentence, then change each key word: dawn → ?, dusk → ?",
      model: "Although the goddess is associated with the early part of the day / morning, this well-known light show is usually seen at night / late evening.",
      why: "1 mark for each idea, in your own words: (1) early day / morning (not “dawn”), (2) night / late evening (not “dusk”).",
      mark(a) {
        const t = T(a);
        const errs = [];
        const day = has(t, /\b(morning|daybreak|sunrise|early (part )?of the day|early (in the )?(day|morning)|start of the day|beginning of the day|first light|break of day)\b/i);
        const night = has(t, /\b(night|evening|after dark|nightfall|after sunset|late (in the )?(day|evening)|darkness)\b/i);
        if (has(t, /\bdawn\b/i)) errs.push("“dawn” is copied from the text. Say it in your own words (for example: the early part of the day / morning).");
        if (has(t, /\bdusk\b/i)) errs.push("“dusk” is copied from the text. Say it in your own words (for example: evening / night).");
        const r = res(2, [
          pt("day", "Goddess linked to the early day / morning (own words)", day, "Say what the goddess is linked to, without the word “dawn”: the early part of the day / morning."),
          pt("night", "Light show seen at night / evening (own words)", night, "Say when the lights are usually seen, without the word “dusk”: at night / in the evening.")
        ], errs);
        return r;
      }
    },
    {
      id: "q5a", no: "5(a)", marks: 1, tag: "C5", kind: "Literal · two examples",
      stem: "Kal says Aboriginal communities believe the auroras are cosmic fires. Identify two examples of communities from paragraph 7 that Kal can give to support his view.",
      strategy: "Support Kal’s view = the communities that see auroras as FIRES. Check each community’s belief before you choose.",
      model: "1) The Gunai people (of eastern Victoria)   2) The community in southwestern Queensland",
      why: "Both examples are needed for the mark. The Gunditjmara people are NOT accepted: they call the aurora “ashes”, not fires.",
      mark(a) {
        const t = T(a);
        const g1 = has(t, /gunai/i), g2 = has(t, /queensland/i);
        const errs = [];
        if (has(t, /gunditjmara/i)) errs.push("Official note: the Gunditjmara people are not accepted — they see auroras as “ashes”, not as fires.");
        const r = res(1, [
          pt("gunai", "Gunai people (eastern Victoria)", g1, "One example is the Gunai people of eastern Victoria."),
          pt("qld", "Community in southwestern Queensland", g2, "The other example is the community in southwestern Queensland.")
        ], errs);
        r.score = g1 && g2 ? 1 : 0;
        return r;
      }
    },
    {
      id: "q5b", no: "5(b)", marks: 2, tag: "C5", kind: "Own words · two ideas",
      stem: "With reference to paragraph 8, how would Shallan support her view (other groups view auroras differently)? Answer in your own words.",
      strategy: "Shallan’s view: a group sees auroras DIFFERENTLY (not as fires). Find what the Sámi thought, then change ‘souls of the dead’ and ‘carry you off into the sky’.",
      model: "The Sámi believed the aurora to be ghosts / spirits (of those who have passed on), and it could carry you away / snatch you into the sky.",
      why: "1 mark: ghosts / spirits of the dead.  1 mark: they could take you away into the sky.",
      mark(a) {
        const t = T(a);
        const errs = [];
        const ghost = has(t, /\b(ghosts?|spirits?|phantoms?)\b/i) && has(t, /\b(dead|died|dying|passed|deceased|departed|gone|late)\b/i);
        const away = has(t, /\b(carr(y|ied|ies)|take|takes|took|snatch\w*|sweep\w*|whisk\w*|lift\w*|pull\w*|drag\w*|abduct\w*|kidnap\w*|bring\w*)\b[^.]{0,25}\b(away|off|up)\b/i) && has(t, /sky|heaven|air|above/i);
        if (has(t, /souls? of the dead/i)) errs.push("“souls of the dead” is copied from the text. Use your own words (ghosts / spirits of people who have died).");
        if (has(t, /carry (you|them|people) off/i)) errs.push("“carry you off” is copied from the text. Try: snatch / take you away.");
        if (has(t, /(stay|stayed) indoors|low profile|waving|whistling|singing/i) && !ghost && !away) errs.push("That is what the Sámi DO. Shallan needs what they BELIEVED the aurora was, and why they feared it.");
        return res(2, [
          pt("ghost", "Believed it was ghosts / spirits of the dead", ghost, "Say what the Sámi believed the lights were: ghosts or spirits of the dead (own words)."),
          pt("away", "Could carry / snatch you away into the sky", away, "Say what the lights could do to a person: take you away into the sky (own words).")
        ], errs);
      }
    },
    {
      id: "q6", no: "6", marks: 1, tag: "C3", kind: "Inferential · writer’s feeling",
      stem: "What does the phrase “This means no waving, whistling, or singing, and even to this day, many Sámi stay indoors when the lights are overhead” (lines 44–46) tell you about how the writer feels about the behaviour of the Sámi?",
      strategy: "Ask: is the writer joining in, judging, or just reporting? The sentence lists unusual behaviour with ‘even to this day’ — what feeling does that suggest?",
      model: "The writer feels surprised / puzzled / confused.",
      why: "Accepted: surprised, puzzled, confused. Not accepted: “taken aback” (idiom).",
      mark(a) {
        const t = T(a);
        const errs = [];
        const ok = has(t, /\b(surpris|puzzl|confus|baffl|bewilder|perplex|astonish|amaz|startl)/i);
        if (has(t, /taken aback/i)) errs.push("Official note: “taken aback” is an idiom and is not accepted. Use a plain word such as surprised or puzzled.");
        if (!ok && has(t, /\b(respect|admir|disapprov|critic|mock|angry|sad|fear|scared|afraid)/i)) errs.push("The writer only reports this behaviour. The feeling asked for is a reaction to something unusual, not respect, blame or fear.");
        const r = res(1, [pt("feel", "Writer feels surprised / puzzled / confused", ok, "Name the feeling: the writer finds the behaviour unusual, so is surprised or puzzled.")], errs);
        return r;
      }
    }
  ];

  /* Q7 · summary of paragraphs 4–6 — 10 content points (with group attribution) + 5 language marks (tutor) */
  const summaryPoints = [
    { id: "p1", group: /viking/i, ownRe: /valkyrie/i, re: t => has(t, /valkyrie/i) && has(t, /\b(soul|spirit|ghost)s?\b|dead|died|fallen|killed/i) && has(t, /\b(reclaim|collect|fetch|claim|take back|taking back|gather|carry|bring|escort|pick(ing)? up|come for|came for|summon|retriev)/i), desc: "Vikings: the Valkyries come to take back the spirits of dead soldiers", fix: "Say that the Valkyries come to take back / collect the spirits of dead soldiers (not ‘retrieve the souls of fallen warriors’)." },
    { id: "p2", group: /viking/i, re: t => has(t, /valkyrie|armou?r/i) && has(t, /armou?r/i) && has(t, /\b(shin|bounc|gleam|glint|glow|flash|sparkl|beam|glitter|glisten)/i), desc: "Vikings: light shining / bouncing off the Valkyries’ armour", fix: "Say the light was shining or bouncing off the Valkyries’ armour (‘reflected’ is copied from the text)." },
    { id: "p3", group: /viking|norse|nordic/i, re: t => has(t, /breath/i) && has(t, /soldier|fighter|warrior|died|dead|killed|fallen|war|battle|combat/i), desc: "Nordic: the breath of soldiers / fighters who died fighting", fix: "Add the breath of soldiers or fighters who died in war." },
    { id: "p4", group: /cree/i, re: t => has(t, /cree/i) && has(t, /\b(ghost|spirit)s?\b/i) && has(t, /\b(speak|talk|contact|reach|message|connect|call|signal|chat)/i), desc: "Cree Indians: ghosts / spirits of the dead trying to speak to the living", fix: "Say the Cree believed the lights were ghosts or spirits trying to speak to the living (‘communicate’ and ‘souls’ are copied)." },
    { id: "p5", group: /algonquin/i, re: t => has(t, /algonquin/i) && has(t, /\bfire\b/i) && has(t, /creator|nanahbozho|made|created|lit|started/i), desc: "Algonquins: a fire made by their creator", fix: "Say the Algonquins believed it was a fire made by their creator (‘built’ is copied)." },
    { id: "p6", group: /finn|finland/i, re: t => has(t, /fire\s*fox/i) && has(t, /\b(fast|quick|speed|swift|dart|rac(e|ed|es|ing)|dash|zoom|rush|bolt|hurtl|streak|flying|flew)/i), desc: "Finnish: a (mythical) fire fox running very fast / darting", fix: "Say the fire fox was moving very fast (running quickly / darting). Official DNA: ‘running’ alone, without an intensifier." },
    { id: "p7", group: /finn|finland/i, re: t => has(t, /spark/i) && has(t, /sky|heaven/i) && has(t, /\b(light(s|ing)? up|lit up|illuminat|set .{0,15}(alight|on fire|ablaze)|blaz|glow|burn|flare|aflame|set fire)/i), desc: "Finnish: sparks light up the sky", fix: "Say the sparks light up the sky (‘ignite’ is copied)." },
    { id: "p8", group: /swed/i, re: t => has(t, /swed/i) && has(t, /herring/i) && has(t, /reflect|shimmer|gleam|glint|glow|shin/i), desc: "Swedish fishermen: reflections of huge schools of herring nearby", fix: "Say the Swedish fishermen believed the lights were the reflection of huge schools of herring close by." },
    { id: "p9", group: /swed/i, re: t => has(t, /\b(luck|lucky|prosper|blessing|favou?r|good omen)/i), desc: "Swedish fishermen: it signified luck", fix: "Say it meant luck (‘good fortune’ is copied)." },
    { id: "p10", group: /swed/i, re: t => has(t, /\b(large|big|huge|abundant|plentiful|bountiful|great|rich|plenty|lots|many|full|good)\b/i) && has(t, /\b(catch|haul)\b|fish/i), desc: "Swedish fishermen: a large catch (of fish)", fix: "Say they expected a large catch of fish (‘generous catch’ is copied)." }
  ];
  const lifted = [
    [/retrieve the souls/i, "retrieve the souls"], [/fallen warriors/i, "fallen warriors"], [/reflected off/i, "reflected off"],
    [/communicate with those still/i, "communicate with those still on earth"], [/sprinting across/i, "sprinting across the snow"],
    [/ignite the sky/i, "ignite the sky"], [/good omen/i, "good omen"], [/generous catch/i, "generous catch"],
    [/giant schools of herring/i, "giant schools of herring"], [/fabled fire fox/i, "fabled fire fox"], [/good fortune/i, "good fortune"]
  ];

  const OPENING = "The Vikings believed that auroras";

  function markSummary(a) {
    const body = T(a).trim();
    const full = OPENING + " " + body;
    const errors = [];
    const wc = (body.match(/\S+/g) || []).length;
    const points = summaryPoints.map(p => {
      let got = p.re(full);
      if (got && p.id !== "p1" && p.id !== "p2" && p.id !== "p3" && p.group && !p.group.test(full)) { got = false; }
      const noGroup = !got && p.re(full) && p.group && !p.group.test(full);
      return pt(p.id, p.desc, got, noGroup ? "Official rule: you must say WHICH group held this belief." : p.fix);
    });
    if (wc > 80) errors.push(`Your summary has ${wc} words. The limit is 80 (the given opening is not counted). Cut the least important words.`);
    if (/^\s*[-•*\d]+[.)]?\s/m.test(body)) errors.push("The summary must be continuous writing, not note form or a list.");
    lifted.forEach(([re, label]) => { if (re.test(body)) errors.push(`Lifted wording: “${label}” is copied from the passage. Use your own words.`); });
    const fox = /fire\s*fox/i.test(body) && /\brunn?(ing|s)?\b|\bran\b/i.test(body) && !points[5].got;
    if (fox) errors.push("Official DNA: “running” without an intensifier (very fast / quickly) is not accepted.");
    const content = points.filter(p => p.got).length;
    return { max: 10, score: content, points, errors, wc, note: "Content points only (10). The 5 language marks need a tutor." };
  }

  const PARA = {
    1: { start: "Auroras have captivated", end: "aurora australis" },
    2: { start: "Inspired by Aurora, the Roman goddess", end: "existence of the aurora" },
    3: { start: "If you have ever been fortunate", end: "pathway to the afterlife" },
    4: { start: "The Vikings celebrated the northern lights", end: "fallen in battle" },
    5: { start: "Many North American tribes", end: "Nanahbozho" },
    6: { start: "A particularly poetic aurora myth", end: "a generous catch" },
    7: { start: "However, not all cultures celebrate", end: "through the aurora" },
    8: { start: "According to researchers, the indigenous", end: "when the lights are overhead" }
  };
  const w1 = n => ({ label: "¶" + n, text: "paragraph " + n, start: PARA[n].start, end: PARA[n].end });
  const where = { q1: w1(1), q2: w1(1), q3a: w1(2), q3b: w1(2), q4: w1(2), q5a: w1(7), q5b: w1(8), q6: w1(8),
    q7: { label: "¶4–6", text: "paragraphs 4–6", start: PARA[4].start, end: PARA[6].end } };

  return { where, id: "aurora", title: "WA3 2024 · Y1 DHP · Text 4 (aurora)", total: 25, minutes: 50, questions, markSummary, summaryOpening: OPENING, version: "1.0.1" };
})();
