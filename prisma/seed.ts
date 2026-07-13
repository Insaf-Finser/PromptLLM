import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const user = await db.user.upsert({
    where: { email: "demo@demo.com" },
    // Update the hash even if the user already exists — important after
    // switching hashing algorithms (argon2 -> bcryptjs). Without this, a
    // demo user seeded before the switch keeps its old argon2-format hash
    // forever, which bcrypt.compare will simply never match (not an
    // error, just an always-false comparison against the wrong format).
    update: { passwordHash },
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