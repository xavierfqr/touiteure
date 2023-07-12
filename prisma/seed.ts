import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { touitosBuilder } from "../app/business/user/utils";

const prisma = new PrismaClient();

const originalTouitos = touitosBuilder(
  "touitos@gmail.com",
  "touitosOriginel",
  "el",
  "touitos"
);
const thomasLeTrain = touitosBuilder(
  "thomas@gmail.com",
  "thomasletrain",
  "thomas",
  "letrain"
);

async function seed() {
  // cleanup the existing database
  await prisma.user
    .deleteMany({
      where: { email: { in: ["touitos@gmail.com", "thomas@gmail.com"] } },
    })
    .catch(() => {
      // no worries if it doesn't exist yet
    });

  const hashedPassword = await bcrypt.hash("secretpassword", 10);

  await prisma.user.create({
    data: {
      email: originalTouitos.email,
      username: originalTouitos.username,
      firstname: originalTouitos.firstname,
      lastname: originalTouitos.lastname,
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

  const thomasPassword = await bcrypt.hash("thomaspassword", 10);

  await prisma.user.create({
    data: {
      email: thomasLeTrain.email,
      username: thomasLeTrain.username,
      firstname: thomasLeTrain.firstname,
      lastname: thomasLeTrain.lastname,
      password: {
        create: {
          hash: thomasPassword,
        },
      },
      tweets: {
        createMany: {
          data: [
            { content: "Salut moi c'est Thomas" },
            { content: "J'aime rire 🙂" },
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
