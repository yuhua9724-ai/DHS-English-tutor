# DHS English Studio v1.3

v1.3: first-attempt score + per-point feedback straight after submit (rule-based, no server), no see-answer-first, rewrite targets lost points with a first-vs-rewrite comparison, 7 verified Landlady sections with school question-type tags. Sections 2–7 rubrics are drafts for a tutor to check.

# DHS English Studio v1.2

A local-first static web application for evidence-led DHS Year 1 English tutoring.

## v1.2 changes

- Every question (A gist, B key detail, C inference) shows its model answer as soon as the student checks it. "Stuck? See the answer first" is also available and is recorded as supported evidence.
- The school PDF can be loaded once from the student's computer (kept only in this browser, never uploaded). The text then shows the current section highlighted, with ▶ n (start) and ■ n (stop) markers.
- In "Edit range", select the section in the PDF and press "Set range from my selection" to set page and first/last words automatically.
- Focus mode hides the navigation completely; a "Menu" button opens it as a drawer. Reading is the widest panel, the questions are narrow, and the divider between them can be dragged (double-click resets).
- Models for sections 2–5 are drafts until the tutor presses "mark this model as checked".
- Third-party: pdf.js 3.11.174 (Apache-2.0) in dist/vendor/.

## v1.1 changes

- Guided reading is now section by section: set the reading range, then gist, key detail and a 3-mark inference.
- Each section: first attempt is locked, then hints, retry, tutor review. The next section opens only after the retry.
- Whole-story summary (3–5 sentences, about 80–120 words) unlocks after all five sections of The Landlady.
- Focus mode (Esc to exit) hides navigation; “Hide text” leaves only the answering panel.
- Tutor review records which step broke down (gist, detail, inference criteria) and feeds the skill map.
- Section 1 starts with a worked model on a different (original) text; support then fades: full sentence frame (§1), frame on request (§2–3), independent (§4–5). The support level is stored with each result.
- Reading ranges for sections 2–5 are editable and saved in the browser (page, first words, last words).

## v1.0 scope

- In-page school-material reader for authorised Google Drive PDFs and PowerPoints.
- Local PDF, image and text preview that stays in the current browser session.
- Guided reading workflow for DHS materials and the user's own reading files.
- Attempt-first exam practice with information-decomposition prompts.
- Tutor marking, lost-mark diagnosis, independent retry, and delayed review scheduling.
- Evidence-weighted skill map and 60% Paper 2 baseline.
- Source provenance and inspection-status registry.
- Browser-local persistence plus JSON export/import.

## Privacy

All learning records are stored in browser `localStorage`. No school credentials, Google Classroom access, uploaded PDFs, or book text are embedded in the site.

## Run locally

Serve `dist/` with any static HTTP server and open `index.html`.

## Planned after v1.0

- OCR/document ingestion and precise question-answer-key matching.
- Configurable LLM tutor endpoint with evaluation gates.
- Audio capture, transcription, and oral-response feedback.
- Parent/tutor accounts and encrypted remote persistence, if explicitly required.
