import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db.js";

const authBaseUrl = process.env.BETTER_AUTH_URL || "http://localhost:8081";
const isSecureDeployment = authBaseUrl.startsWith("https://");
const clientUrls = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

if (process.env.NODE_ENV !== "production") {
    clientUrls.push("http://localhost:3000");
}

export const auth = betterAuth({
        baseURL: authBaseUrl,
        secret: process.env.BETTER_AUTH_SECRET,
        trustedOrigins: clientUrls,
        advanced: {
            defaultCookieAttributes: {
                sameSite: isSecureDeployment ? "none" : "lax",
                secure: isSecureDeployment,
            },
        },
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "sqlite", ...etc
    }),
     socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    }
});