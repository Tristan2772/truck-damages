# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Create a `.env` file and update with your own values.

Required auth + mail variables include:

```bash
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
BETTER_AUTH_TRUSTED_ORIGINS=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NUXT_NODEMAILER_AUTH_PASS=
```

Make sure to install dependencies:

```bash
# npm
npm install
```

## Auth Flow

Email and password auth requires email verification before users can sign in.

1. User signs up with name, email, and password.
2. A one-time verification code is emailed to the user.
3. User verifies the code on `/verify-email`.
4. User signs in with the same email and password.

The verification code currently expires in 5 minutes and resend is throttled with a 60-second cooldown in the client flow.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

To test sign-in from another device on your LAN (for example, iPhone), run:

```bash
# npm
npm run dev -- --host 0.0.0.0
```

For Better Auth origin validation in development, include both localhost and LAN origins in `BETTER_AUTH_TRUSTED_ORIGINS` (comma-separated), for example:

```bash
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://192.168.0.90:3000
```

## Production

Build the application for production:

```bash
# npm
npm run build
```

Locally preview production build:

```bash
# npm
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
