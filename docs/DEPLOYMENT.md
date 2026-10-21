# Deployment

Required Vercel variables are managed `DATABASE_URL` and secret `AUTH_SECRET`. `ETHEREUM_RPC_URL` is optional; when absent, the application uses the documented free PublicNode mainnet endpoint. Configure a private provider URL only through Vercel secrets and never expose it to client code.

GitHub CI runs lint, unit tests, type checking, and production build. The manual **Production E2E** workflow installs Chromium in GitHub and verifies a genuine latest-block lookup on the stable Vercel deployment.
