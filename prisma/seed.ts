import argon2 from "argon2";

import { UserRole } from "../src/generated/prisma/enums";
import { prisma } from "../src/shared/database/prisma";

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

async function seedInitialAdmin(): Promise<void> {
  const name = requiredEnvironmentVariable("SEED_ADMIN_NAME");
  const email = requiredEnvironmentVariable("SEED_ADMIN_EMAIL").toLowerCase();
  const password = requiredEnvironmentVariable("SEED_ADMIN_PASSWORD");

  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must contain at least 8 characters");
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await argon2.hash(password),
        role: UserRole.ADMIN,
        active: true,
      },
    });

    return;
  }

  const passwordMatches = await argon2
    .verify(existingAdmin.passwordHash, password)
    .catch(() => false);
  const needsUpdate =
    existingAdmin.name !== name ||
    existingAdmin.role !== UserRole.ADMIN ||
    !existingAdmin.active ||
    !passwordMatches;

  if (!needsUpdate) {
    return;
  }

  await prisma.user.update({
    where: { id: existingAdmin.id },
    data: {
      name,
      role: UserRole.ADMIN,
      active: true,
      sessionVersion: { increment: 1 },
      ...(passwordMatches ? {} : { passwordHash: await argon2.hash(password) }),
    },
  });
}

seedInitialAdmin()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
