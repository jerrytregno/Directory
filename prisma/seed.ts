import { loadEnvFile } from "node:process";
import { FirebaseAuthError, signIn, signUp } from "../src/lib/firebase-auth";
import { runWithToken } from "../src/lib/firebase-db";
import { upsertCategory, upsertUserProfile } from "../src/lib/store";

const categories = [
  {
    name: "AI Tools",
    slug: "ai-tools",
    description: "Assistants, models, and products built around artificial intelligence.",
    sortOrder: 1,
  },
  {
    name: "SEO Tools",
    slug: "seo-tools",
    description: "Search research, content planning, and site auditing products.",
    sortOrder: 2,
  },
  {
    name: "Marketing",
    slug: "marketing",
    description: "Campaigns, email, and software for reaching customers.",
    sortOrder: 3,
  },
  {
    name: "Productivity",
    slug: "productivity",
    description: "Planning, writing, and everyday tools for getting work done.",
    sortOrder: 4,
  },
  {
    name: "Automation",
    slug: "automation",
    description: "Workflows and integrations that take repetitive work off your plate.",
    sortOrder: 5,
  },
  {
    name: "Business Software",
    slug: "business-software",
    description: "Operations, finance, and platforms that run a company.",
    sortOrder: 6,
  },
  {
    name: "Developer Tools",
    slug: "developer-tools",
    description: "APIs, infrastructure, and tools for building software.",
    sortOrder: 7,
  },
  {
    name: "Design Tools",
    slug: "design-tools",
    description: "Interfaces, graphics, and creative production tools.",
    sortOrder: 8,
  },
  {
    name: "Sales & CRM",
    slug: "sales-crm",
    description: "Pipelines, outreach, and customer records for revenue teams.",
    sortOrder: 9,
  },
  {
    name: "Social Media",
    slug: "social-media",
    description: "Publishing, scheduling, and community tools.",
    sortOrder: 10,
  },
  {
    name: "Analytics",
    slug: "analytics",
    description: "Measurement, reporting, and product insight.",
    sortOrder: 11,
  },
  {
    name: "Other",
    slug: "other",
    description: "Businesses and products that sit outside the other categories.",
    sortOrder: 12,
  },
];

async function ensureAuthUser(email: string, password: string) {
  try {
    return await signUp(email, password);
  } catch (error) {
    if (error instanceof FirebaseAuthError && error.code.startsWith("EMAIL_EXISTS")) {
      return signIn(email, password);
    }
    throw error;
  }
}

async function main() {
  loadEnvFile(".env");
  const adminAuth = await ensureAuthUser("admin@blazly.com", process.env.ADMIN_PASSWORD || "Vision@_2404");

  await runWithToken(adminAuth.idToken, async (db) => {
    await upsertUserProfile(db, {
      id: adminAuth.localId,
      email: "admin@blazly.com",
      name: "Blazly Admin",
      role: "admin",
    });

    for (const category of categories) {
      await upsertCategory(db, category);
    }
  });

  console.log("Seeded Blazly categories in Firebase.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
