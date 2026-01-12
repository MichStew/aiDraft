
  # Anti-Vaping Health App

  This is a code bundle for Anti-Vaping Health App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Create a `.env` file (see `.env.example`) and set at least `MONGODB_URI`, `MONGODB_DATABASE`, `JWT_SECRET`, and `VITE_API_BASE_URL`.
  For Google OAuth, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL`.
  Set `APP_ORIGIN` to your frontend URL so OAuth redirects back correctly. Optionally set `APP_NAME` for MFA issuer labels.

  Run `npm run dev` to start the Vite development server.

  Run `npm run dev:server` to start the API server for auth + MongoDB.
  
