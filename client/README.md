# ISTE GMRIT Client

React/Vite frontend for the ISTE GMRIT Student Chapter website.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the backend from `../server` first.

3. Start the client:

   ```bash
   npm run dev
   ```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`.

## Environment

Most local development works without a client env file because the Vite proxy handles API calls.

If the API is hosted somewhere else, create `client/.env.local`:

```bash
VITE_API_URL=http://localhost:5000/api
```

## Quality Checks

```bash
npm run lint
npm run test
npm run build
```

## Performance Notes

Routes are lazy-loaded in `src/App.jsx`. Heavy visual/editor code is also split:

- `src/components/home/HeroBackdrop.jsx` lazy-loads the Three.js hero.
- `src/components/LazyRichTextEditor.jsx` lazy-loads TipTap.

Keep new dashboard-only or media-heavy features behind route/component lazy boundaries.
