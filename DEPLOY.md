# How to deploy DHS English Studio v1.3

## 1. Push to your empty GitHub repo

1. Download and unzip this folder.
2. Open a terminal in the unzipped folder.
3. Run:

```bash
git init
git add .
git commit -m "DHS English Studio v1.3 – first-attempt scoring + per-point feedback"
git branch -M main
git remote add origin https://github.com/yuhua9724-ai/DHS-English-tutor.git
git push -u origin main
```

(If the repo already has a README, use `git pull origin main --allow-unrelated-histories` first, or force push if you are sure.)

## 2. Deploy on Vercel

1. Go to https://vercel.com and log in (with your GitHub account).
2. Click **Add New Project**.
3. Import the repository `yuhua9724-ai/DHS-English-tutor`.
4. Framework Preset: **Other**.
5. Click **Deploy**.

After 1–2 minutes you will get a live URL (something like `dhs-english-tutor.vercel.app`).

## 3. Local test (optional)

```bash
npx serve .
```

Then open http://localhost:3000

## What’s included in v1.3

- First-attempt score + per-point feedback immediately after submit
- Rule-based marking (no server needed)
- No “see answer first” button
- Rewrite targets lost points; first vs rewrite comparison
- The Landlady sections with school question-type tags
