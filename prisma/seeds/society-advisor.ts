import * as bcrypt from "bcryptjs";
import prisma from "../../src/db";
import { getRandomDate } from ".";

export const seedSocietiesAndAdvisors = async () => {
  const advisors = await prisma.societyAdvisor.findMany();

  for (const advisor of advisors) {
    const society = await prisma.society.upsert({
      where: { name: advisor.society },
      update: {},
      create: {
        name: advisor.society,
        description: "",
        createdAt: getRandomDate(
          new Date("2023-01-01"),
          new Date("2024-01-01")
        ),
      },
    });

    await prisma.advisor.upsert({
      where: { email: advisor.email },
      update: {},
      create: {
        displayName: advisor.displayName,
        firstName: advisor.firstName,
        lastName: advisor.lastName,
        email: advisor.email,
        password: await bcrypt.hash("12345678", 10),
        avatar: `https://avatar.iran.liara.run/username?username=${advisor.firstName}+${advisor.lastName}`,
        isEmailVerified: true,
        createdAt: new Date("2023-01-01"),
        society: { connect: { id: society.id } },
      },
    });
  }
};
