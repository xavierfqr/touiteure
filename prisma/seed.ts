import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "touitos@gmail.com";
  const username = "touitosOriginel";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("secretpassword", 10);

  await prisma.user.create({
    data: {
      email,
      username,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      tweets: {
        createMany: {
          data: [
            { content: "Hello World" },
            { content: "Ca va vous ?" },
            {
              content:
                "La catastrophe minière de Coalbrook se produit en 1960 dans la mine de charbon du même nom, en Afrique du Sud, et plus précisément dans l'État Libre d'Orange.",
              attachment:
                "https://plus.unsplash.com/premium_photo-1670793631505-98e872b02418",
            },
          ],
        },
      },
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
