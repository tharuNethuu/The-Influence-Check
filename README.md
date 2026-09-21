# How Much Do You Trust the Influence? — Survey App

A mobile-friendly, dark-theme React survey that asks one question per screen
(wipe transition between pages) and saves every response to a Google Sheet,
the same way a Google Form does.

## What's inside

```
src/
  data/questions.js        All 40 questions + intro/outro copy
  components/
    IntroCard.jsx           Welcome screen
    OutroCard.jsx           Thank-you screen + submit status
    QuestionCard.jsx        Renders single/multi/scale/dropdown inputs
    ArrowButton.jsx         Animated circular "next" arrow
  lib/submit.js             Sends answers to your Google Apps Script Web App
  App.jsx                   Page state machine + wipe transition
  index.css                 Black background, glass card, Helvetica, animations
apps-script/Code.gs          Paste into Google Sheets > Extensions > Apps Script
```

## 1. Run it locally

```bash
npm install
npm run dev
```

Open the printed local URL on your phone (or resize your browser) to see the
mobile layout.

## 2. Connect it to a Google Sheet

1. Create a new Google Sheet (this will hold your responses).
2. In the Sheet: **Extensions > Apps Script**.
3. Delete the placeholder code and paste in the contents of
   `apps-script/Code.gs`.
4. **Deploy > New deployment > Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize it, then copy the Web App URL
   (looks like `https://script.google.com/macros/s/AKfycb.../exec`).
6. In the project root, copy `.env.example` to `.env` and paste your URL:

   ```
   VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
   ```

7. Restart `npm run dev` (Vite only reads `.env` on startup).

The first submission automatically creates a header row in the sheet from
the question text, followed by one row per respondent — just like Google
Form responses.

> Note: the browser calls the Apps Script URL with `mode: "no-cors"` because
> Apps Script doesn't return CORS headers. That means the app can't read a
> confirmation back, so it shows a generic "saved" state once the request is
> sent. Check the Sheet directly to confirm rows are arriving.

## 3. Customize page backgrounds

Every entry in `src/data/questions.js` (and `INTRO`/`OUTRO`) has a `bg`
field. Leave it `null` for the plain black background, or set it to an image
URL to give that specific page a background image:

```js
{
  id: "q5_platforms",
  ...
  bg: "/images/social-bg.jpg", // put the file in /public/images
}
```

## 4. Build for production

```bash
npm run build
```

This outputs a static site in `dist/` that you can host anywhere (Netlify,
Vercel, GitHub Pages, etc.) — just make sure `VITE_GOOGLE_SCRIPT_URL` is set
at build time.

## Editing the questions

Everything about the survey — wording, options, question order, scale
labels, district list — lives in `src/data/questions.js`. Add, remove, or
reorder objects in the `QUESTIONS` array and the app (progress bar, wipe
transitions, Sheet columns) updates automatically.
