import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Better Auth server instance — single source of truth for sessions
// (spec §2, §6.4). MongoDB adapter, email+password, Google social.
const client = new MongoClient(
  process.env.MONGODB_URI || "mongodb://localhost:27017/edusphere"
);
const db = client.db();

let baseURL = process.env.BETTER_AUTH_URL || "http://localhost:4000";
if (!baseURL.endsWith("/api/auth")) {
  baseURL = `${baseURL.replace(/\/$/, "")}/api/auth`;
}

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  baseURL: baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:3000"],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  cookie: process.env.NODE_ENV === "production" ? {
    sameSite: "none",
  } : undefined,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      // Students + Teachers (spec §1). Chrome stays role-generic.
      role: {
        type: "string",
        defaultValue: "student",
        input: true,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
