import type { User } from "better-auth";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { emailOTP } from "better-auth/plugins";

import db from "@/lib/db/index";

import env from "../lib/env";

export type userWithId = Omit<User, "id"> & {
  id: number;
};

function parseTrustedOrigins(rawValue?: string) {
  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(",")
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);
}

const trustedOrigins = Array.from(new Set([
  env.BETTER_AUTH_URL,
  ...parseTrustedOrigins(env.BETTER_AUTH_TRUSTED_ORIGINS),
]));

export const auth = betterAuth({
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/get-session") {
        if (!ctx.context.session) {
          return ctx.json({
            session: null,
            user: null,
          });
        }
        return ctx.json(ctx.context.session);
      }
    }),
  },
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  advanced: {
    database: {
      generateId: false,
    },
  },
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      const { sendMail } = useNodeMailer();

      void sendMail({
        to: user.email,
        subject: "Reset your password",
        text: [
          "A password reset was requested for your account.",
          "",
          `Reset your password: ${url}`,
          "",
          "If you did not request this, you can ignore this email.",
        ].join("\n"),
        html: `<p>A password reset was requested for your account.</p><p><a href="${url}">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p>`,
      }).catch((error: unknown) => {
        console.error("Failed to send password reset email", error);
      });
    },
  },
  plugins: [
    emailOTP({
      allowedAttempts: 5,
      expiresIn: 300,
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        const { sendMail } = useNodeMailer();

        const subjectByType: Record<string, string> = {
          "email-verification": "Your verification code",
          "forget-password": "Your password reset code",
          "sign-in": "Your sign-in code",
        };

        const subject = subjectByType[type] ?? "Your one-time code";
        const text = [
          `Your code is: ${otp}`,
          "",
          "This code expires in 5 minutes.",
          "If you did not request this code, you can ignore this email.",
        ].join("\n");

        void sendMail({
          to: email,
          subject,
          text,
          html: `<p>Your code is: <strong>${otp}</strong></p><p>This code expires in 5 minutes.</p><p>If you did not request this code, you can ignore this email.</p>`,
        }).catch((error: unknown) => {
          console.error("Failed to send auth OTP email", error);
        });
      },
    }),
  ],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});
