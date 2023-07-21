import { createUserSession } from "~/business/user/services/session.server";
import { type User } from "@prisma/client";
import { prisma } from "../../app/db.server";
import bcrypt from "bcryptjs";

export async function createVerifiedUserNull() {
  return null;
}

async function createVerifiedUser(
  email: User["email"],
  username: User["username"],
  password: string,
  firstname: User["firstname"],
  lastname: User["lastname"]
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      username,
      firstname,
      lastname,
      isVerified: true,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

async function createAndLogin(
  email: User["email"],
  username: User["username"],
  password: string,
  firstname: User["firstname"],
  lastname: User["lastname"]
) {
  const user = await createVerifiedUser(
    email,
    username,
    password,
    firstname,
    lastname
  );

  const response = await createUserSession({
    request: new Request("test://test"),
    userId: user.id,
    remember: false,
    redirectTo: "/",
  });

  const cookieValue = response.headers.get("Set-Cookie");
  if (!cookieValue) {
    throw new Error("Cookie missing from createUserSession response");
  }
  return user;
}

createAndLogin(
  process.argv[2],
  process.argv[3],
  process.argv[4],
  process.argv[5],
  process.argv[6]
);
