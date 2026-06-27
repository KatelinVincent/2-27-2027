# The Nemeths — Wedding Website

Jacob & Kate Nemeth · February 27, 2027 · Texas Hill Country

---

## Getting Started

### 1. Install dependencies

```bash
cd nemeth-wedding
npm install
```

### 2. Run locally

```bash
gatsby develop
```

Open `http://localhost:8000` in your browser.

---

## Customizing Content

| What to change | Where to find it |
|---|---|
| Story timeline text | `src/components/Story.jsx` — edit the `timelineItems` array at the top |
| Wedding detail cards | `src/components/Details.jsx` — edit the `cards` array at the top |
| Photo placeholders | `src/components/Photos.jsx` — drop photos into `src/images/` and swap `<PhotoPlaceholder>` with `<StaticImage>` (instructions in the file) |
| Wedding date / time (countdown) | `src/components/Hero.jsx` — change the date in `useCountdown("2027-02-27T17:00:00")` |
| Site URL (for SEO) | `gatsby-config.js` — update `siteUrl` |
| Color palette | `src/styles/global.css` — CSS variables in `:root` |

---

## Adding Photos

1. Drop your photos into `src/images/` — name them:
   - `photo-tall.jpg` (the large left portrait)
   - `photo-1.jpg` through `photo-4.jpg`

2. Open `src/components/Photos.jsx` and replace each `<PhotoPlaceholder />` with:

```jsx
<StaticImage
  src="../images/photo-tall.jpg"
  alt="Jacob and Kate"
  layout="fullWidth"
  style={{ borderRadius: 6, height: "100%" }}
/>
```

Make sure to uncomment the `StaticImage` import at the top of the file.

---

## Deploying to Netlify

### First deploy

1. Push this project to a GitHub repo.
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**.
3. Select your repo. Netlify will auto-detect Gatsby and set:
   - Build command: `gatsby build`
   - Publish directory: `public`
4. Click **Deploy site**.

### Connecting your domain

1. In Netlify → **Domain management** → **Add custom domain** → enter your domain.
2. Netlify will show you DNS records to add (either nameservers or an A + CNAME record).
3. Log into your domain registrar (GoDaddy, Namecheap, etc.) and add those records.
4. SSL will be issued automatically within minutes.

### Future deploys

Every `git push` to your main branch triggers a rebuild and redeploy automatically.

---

## Project Structure

```
nemeth-wedding/
├── gatsby-config.js
├── package.json
├── src/
│   ├── components/
│   │   ├── Layout.jsx       ← wraps all pages (Nav + Footer)
│   │   ├── Nav.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx         ← countdown, names, botanical art
│   │   ├── Story.jsx        ← timeline — edit your story here
│   │   ├── Photos.jsx       ← photo grid — swap in real photos
│   │   ├── AisleGame.jsx    ← the Frogger game
│   │   └── Details.jsx      ← ceremony, reception, coming soon events
│   ├── pages/
│   │   └── index.jsx        ← main page
│   ├── styles/
│   │   └── global.css       ← colors, typography, shared helpers
│   └── images/              ← drop your photos here
└── static/                  ← favicons, any static assets
```
