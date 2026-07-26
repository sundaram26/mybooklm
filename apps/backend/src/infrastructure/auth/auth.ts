import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../db/prisma";
import { anonymous } from "better-auth/plugins";
import { env } from "../../config/env.config";
import { dash } from "@better-auth/infra";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID || "",
            clientSecret: env.GOOGLE_CLIENT_SECRET || "",
        },
        github: {
            clientId: env.GITHUB_CLIENT_ID || "",
            clientSecret: env.GITHUB_CLIENT_SECRET || "",
        }
    },
    plugins: [
        anonymous(),
        dash()
    ],
});
