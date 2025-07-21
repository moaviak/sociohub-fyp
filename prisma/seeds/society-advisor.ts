import * as bcrypt from "bcryptjs";
import prisma from "../../src/db";
import { getRandomDate } from ".";

export const seedSocietiesAndAdvisors = async () => {
  const advisorsData = await prisma.societyAdvisor.findMany();
  console.log({ advisorsData });

  for (const advisorData of advisorsData) {
    await prisma.$transaction(
      async (tx) => {
        const society = await tx.society.upsert({
          where: { name: advisorData.society },
          update: {},
          create: {
            name: advisorData.society,
            description: "",
            createdAt: getRandomDate(
              new Date("2023-01-01"),
              new Date("2024-01-01")
            ),
          },
        });

        const advisor = await tx.advisor.upsert({
          where: { email: advisorData.email },
          update: {},
          create: {
            displayName: advisorData.displayName,
            firstName: advisorData.firstName,
            lastName: advisorData.lastName,
            email: advisorData.email,
            password: await bcrypt.hash("12345678", 10),
            avatar: `https://avatar.iran.liara.run/username?username=${advisorData.firstName}+${advisorData.lastName}`,
            isEmailVerified: true,
            createdAt: new Date("2023-01-01"),
            society: { connect: { id: society.id } },
          },
        });

        const user = await tx.user.upsert({
          where: { advisorId: advisor.id },
          create: {
            advisorId: advisor.id,
          },
          update: {},
        });

        await tx.chat.upsert({
          where: { societyId: society.id },
          update: {},
          create: {
            name: `${society.name} - General`,
            type: "GROUP",
            societyId: society.id,
            adminId: user.id,
            participants: {
              connect: { id: user.id },
            },
          },
        });
      },
      { timeout: 10000 }
    );
  }
};

seedSocietiesAndAdvisors()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
