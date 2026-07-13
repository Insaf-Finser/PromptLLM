import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const db = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash("demo1234", { type: argon2.argon2id });

  const user = await db.user.upsert({
    where: { email: "demo@demo.com" },
    update: {},
    create: { email: "demo@demo.com", passwordHash },
  });

  const prompt = await db.prompt.create({
    data: {
      userId: user.id,
      name: "Support reply drafter",
      description: "Drafts a first-pass reply to a customer support ticket.",
    },
  });

  const version = await db.promptVersion.create({
    data: {
      promptId: prompt.id,
      versionNumber: 1,
      templateText:
        "Hi {{customer_name}}, thanks for reaching out about {{issue}}. " +
        "I'm looking into this now and will follow up within one business day.",
      variableNames: ["customer_name", "issue"],
      model: "llama-3.3-70b-versatile",
    },
  });

  await db.testCase.create({
    data: {
      promptId: prompt.id,
      name: "Late delivery, frustrated tone",
      variableValues: {
        customer_name: "Jordan",
        issue: "a package that's four days late",
      },
      expectedCriteria:
        "Acknowledges the delay specifically, gives a concrete next step, no generic filler apology.",
    },
  });

  console.log(`Seeded demo user (demo@demo.com / demo1234), prompt ${prompt.id}, version ${version.id}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
