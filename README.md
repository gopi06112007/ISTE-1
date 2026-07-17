# ISTE GMRIT Website

Full-stack website for the ISTE GMRIT Student Chapter.

## Structure

- `client/`: React, Vite, Tailwind frontend
- `server/`: Express, MongoDB, Cloudinary backend

## Prerequisites

- Node.js 20+
- MongoDB connection string
- Cloudinary credentials for uploads

## Backend Setup

```bash
cd server
npm install
copy .env.example .env
npm run seed
npm run dev
```

Update `server/.env` with real values before running the server.

Important variables:

- `PORT`: defaults to `5000`
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: long random secret for auth cookies
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: image upload config
- `CLIENT_URL`: local frontend URL, usually `http://localhost:5173`

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

The client proxies `/api` and `/uploads` to `http://localhost:5000` in development.

## Verification

Run these before shipping changes:

```bash
cd client
npm run lint
npm run test
npm run build

cd ../server
npm run test
```

## Deployment Notes

- Build the client with `npm run build` from `client/`.
- Serve API routes from the Express server.
- Set production `CLIENT_URL`, `MONGO_URI`, `JWT_SECRET`, and Cloudinary values in the hosting platform.
- Keep `JWT_SECRET` and Cloudinary secrets out of git.
