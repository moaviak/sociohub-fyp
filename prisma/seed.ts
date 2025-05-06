import prisma from "../src/db";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  await prisma.societyAdvisor.deleteMany();
  await prisma.societyAdvisor.createMany({
    data: [
      {
        displayName: "Dr. Syed Asim Shah",
        firstName: "Syed Asim",
        lastName: "Shah",
        email: "dr.asimshah@cuiatk.edu.pk",
        society: "Young Entrepreneurs Society (YES)",
      },
      {
        displayName: "Ms. Ameena",
        firstName: "Ameena",
        lastName: "Arshad",
        email: "ameena.arshad@cuiatk.edu.pk",
        society: "Environmental Protection Society (EPS)",
      },
      {
        displayName: "Mr. Yasir Muhammad",
        firstName: "Yasir",
        lastName: "Muhammad",
        email: "Yasir.ee@ciit-attock.edu.pk",
        society: "COMSATS Science Society (CSS)",
      },
      {
        displayName: "Ms. Sadia Ejaz",
        firstName: "Sadia",
        lastName: "Ejaz",
        email: "sadia@ciit-attock.edu.pk",
        society: "COMSATS Arts Society (CAS)",
      },
      {
        displayName: "Mr. Muhammad Qasim Khan",
        firstName: "Muhammad Qasim",
        lastName: "Khan",
        email: "qasimkhan@cuiatk.edu.pk",
        society: "COMSATS Freelancers Society (CFS)",
      },
      {
        displayName: "Dr. Muhammad Awais",
        firstName: "Awais",
        lastName: "Muhammad",
        email: "awais@ciit-attock.edu.pk",
        society: "COMSATS Health Awareness Society (CHAS)",
      },
      {
        displayName: "Ms. Tasneem Fiza",
        firstName: "Tasneem",
        lastName: "Fiza",
        email: "fizatasneem@cuiatk.edu.pk",
        society: "COMSATS Literary and Debating Society (CLDS)",
      },
      {
        displayName: "Dr. Adeel Saqib",
        firstName: "Adeel",
        lastName: "Saqib",
        email: "a.saqib@ciit-attock.edu.pk",
        society: "Attock Welfare Society (AWS)",
      },
      {
        displayName: "Dr. Atiq ur Rehman",
        firstName: "Atiq",
        lastName: "ur Rehman",
        email: "atiq@cuiatk.edu.pk",
        society: "CU Mathematical Society (CUMAS)",
      },
      {
        displayName: "Dr. Muhammad Bilal Khan",
        firstName: "Muhammad Bilal",
        lastName: "Khan",
        email: "engr_tanoli@ciit-attock.edu.pk",
        society: "COMSATS IEEE Student Society (CISS)",
      },
      {
        displayName: "Dr. Maimona Rafiq",
        firstName: "Maimona",
        lastName: "Rafiq",
        email: "maimona.rafiq@cuiatk.edu.pk",
        society: "COMSATS Dramatic Society (CDS)",
      },
      {
        displayName: "Mr. Armughan Ali",
        firstName: "Armughan",
        lastName: "Ali",
        email: "armughan_ali@cuiatk.edu.pk",
        society: "COMSATS Softech Society (CSS)",
      },
    ],
  });

  await prisma.privilege.deleteMany();
  await prisma.privilege.createMany({
    data: [
      {
        key: "event_management",
        title: "Event Management",
        description: "Can create, update, and delete events.",
      },
      {
        key: "member_management",
        title: "Member Management",
        description: "Can invite, approve, or remove members from the society.",
      },
      {
        key: "announcement_management",
        title: "Announcement Management",
        description: "Can create and publish announcements.",
      },
      {
        key: "content_management",
        title: "Content Management",
        description:
          "Can create, edit, and delete posts on the society’s public page.",
      },
      {
        key: "event_ticket_handling",
        title: "Event Ticket Handling",
        description: "Can scan and validate tickets to manage event entry.",
      },
      {
        key: "payment_finance_management",
        title: "Payment and Finance Management",
        description:
          "Can manage society finances, event payments, withdrawals, and payment methods.",
      },
      {
        key: "society_settings_management",
        title: "Society Settings Management",
        description: "Can update society settings.",
      },
    ],
  });

  if (process.env.NODE_ENV === "development") {
    await prisma.advisor.deleteMany();
    await prisma.role.deleteMany();
    await prisma.society.deleteMany();
    await prisma.student.deleteMany();

    await prisma.student.createMany({
      data: [
        {
          email: "sp22-bcs-051@cuiatk.edu.pk",
          firstName: "Muhammad",
          lastName: "Moavia",
          password: await bcrypt.hash("12345678", 10),
          avatar:
            "https://res.cloudinary.com/dzag85vsc/image/upload/v1746340668/pp_fevwaq.jpg",
          registrationNumber: "SP22-BCS-051",
          isEmailVerified: true,
        },
        {
          email: "sp22-bcs-015@cuiatk.edu.pk",
          firstName: "Tanveer",
          lastName: "Ahmed",
          password: await bcrypt.hash("12345678", 10),
          avatar:
            "https://avatar.iran.liara.run/username?username=Tanveer+Ahmed",
          registrationNumber: "SP22-BCS-015",
          isEmailVerified: true,
        },
        {
          email: "sp22-bcs-033@cuiatk.edu.pk",
          firstName: "Muhammad",
          lastName: "Awais",
          password: await bcrypt.hash("12345678", 10),
          avatar:
            "https://avatar.iran.liara.run/username?username=Muhammad+Awais",
          registrationNumber: "SP22-BCS-033",
          isEmailVerified: true,
        },
      ],
    });

    await prisma.society.createMany({
      data: [
        {
          name: "COMSATS Softech Society (CSS)",
          description:
            "To provide a platform for engaging more students in different technical fields by making the leading way in technical areas.",
          logo: "https://res.cloudinary.com/dzag85vsc/image/upload/v1746337886/COMSATS%20Softech%20Society%20%28CSS%29/softech.jpg",
        },
        {
          name: "COMSATS Freelancers Society (CFS)",
          description:
            "To become a platform for promoting the learning through freelancing and digital marketing.",
          logo: "https://res.cloudinary.com/dzag85vsc/image/upload/v1746338090/COMSATS%20Freelancers%20Society%20%28CFS%29/freelancers.jpg",
        },
        {
          name: "COMSATS Literary and Debating Society (CLDS)",
          description:
            "To seek a world where each student can grow their voice and have opportunities to meaningfully and authentically exercise their voice in public discourse throughout their life.",
          logo: "https://res.cloudinary.com/dzag85vsc/image/upload/v1746338261/COMSATS%20Literary%20and%20Debating%20Society%20%28CLDS%29/clads.jpg",
        },
      ],
    });

    await prisma.role.createMany({
      data: [
        {
          name: "Member",
          societyId: (
            await prisma.society.findUniqueOrThrow({
              where: { name: "COMSATS Softech Society (CSS)" },
            })
          ).id,
        },
        {
          name: "Member",
          societyId: (
            await prisma.society.findUniqueOrThrow({
              where: { name: "COMSATS Freelancers Society (CFS)" },
            })
          ).id,
        },
        {
          name: "Member",
          societyId: (
            await prisma.society.findUniqueOrThrow({
              where: { name: "COMSATS Literary and Debating Society (CLDS)" },
            })
          ).id,
        },
      ],
    });

    await prisma.advisor.createMany({
      data: [
        {
          email: "armughan_ali@cuiatk.edu.pk",
          firstName: "Armughan",
          lastName: "Ali",
          password: await bcrypt.hash("12345678", 10),
          displayName: "Mr. Armughan Ali",
          avatar:
            "https://avatar.iran.liara.run/username?username=Armughan+Ali",
          isEmailVerified: true,
          societyId: (
            await prisma.society.findUniqueOrThrow({
              where: { name: "COMSATS Softech Society (CSS)" },
            })
          ).id,
        },
        {
          email: "qasimkhan@cuiatk.edu.pk",
          firstName: "Muhammad Qasim",
          lastName: "Khan",
          password: await bcrypt.hash("12345678", 10),
          displayName: "Mr. Muhammad Qasim Khan",
          avatar:
            "https://avatar.iran.liara.run/username?username=Muhammad+Khan",
          isEmailVerified: true,
          societyId: (
            await prisma.society.findUniqueOrThrow({
              where: { name: "COMSATS Freelancers Society (CFS)" },
            })
          ).id,
        },
        {
          email: "fizatasneem@cuiatk.edu.pk",
          firstName: "Tasneem",
          lastName: "Fiza",
          password: await bcrypt.hash("12345678", 10),
          displayName: "Ms. Tasneem Fiza",
          avatar:
            "https://avatar.iran.liara.run/username?username=Tasneem+Fiza",
          isEmailVerified: true,
          societyId: (
            await prisma.society.findUniqueOrThrow({
              where: { name: "COMSATS Literary and Debating Society (CLDS)" },
            })
          ).id,
        },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
