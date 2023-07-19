import type { Password, User } from "@prisma/client";
import { gcsUploadImageHandler } from "../../../technical/gcs.utils";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

import config from "~/config";
import { prisma } from "~/db.server";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByUsername(username: User["username"]) {
  return prisma.user.findUnique({ where: { username } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser({
  email,
  username,
  firstname,
  lastname,
  password,
}: Pick<User, "email" | "username" | "firstname" | "lastname"> & {
  password: string;
}) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      username,
      firstname,
      lastname,
      magicLinkToken: nanoid(config.auth.magicLinkTokenLength),
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function updateUser(
  userId: User["id"],
  updatedUser: {
    firstname?: User["firstname"];
    lastname?: User["lastname"];
    biography?: User["biography"];
    isFollowOnly?: User["isFollowOnly"];
  }
) {
  return prisma.user.update({
    data: {
      ...updatedUser,
    },
    where: {
      id: userId,
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

export async function follow(followedId: string, userId: string) {
  return prisma.user.update({
    where: { id: followedId },
    data: { followedBy: { connect: { id: userId } } },
  });
}

export async function unfollow(followedId: string, userId: string) {
  return prisma.user.update({
    where: { id: followedId },
    data: { followedBy: { disconnect: { id: userId } } },
  });
}

export async function isUserFollowed(followedId: string, userId: string) {
  const result = await prisma.user.findUnique({
    where: { id: followedId },
    select: { _count: { select: { followedBy: { where: { id: userId } } } } },
  });

  return result?._count.followedBy === 1;
}
export const gcsUploadUserPFPHandler = async ({
  name,
  data,
  contentType,
  filename,
}: {
  name: string;
  data: AsyncIterable<Uint8Array>;
  contentType: string;
  filename?: string;
}) => {
  if (name !== "profilePicture") {
    return;
  }

  if (!filename) {
    return "default";
  }

  return gcsUploadImageHandler({ name, data, contentType, filename });
};
