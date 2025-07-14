import prisma from "../../src/db";
import * as dotenv from "dotenv";
import { seedSocietiesAndAdvisors } from "./society-advisor";
import { seedRoles } from "./roles";
import { seedStudents } from "./students";
import { seedStudentSocietyMemberships } from "./societyMembership";
import { seedEvents } from "./events";
import { seedEventRegistrations } from "./event-registrations";
import { seedPaymentTransactions } from "./payment-transactions";
import { seedAnnouncements } from "./announcements";
import { seedTasks } from "./tasks";

dotenv.config();

export function getRandomDate(startDate: Date, endDate: Date) {
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();

  // Calculate a random timestamp within the range
  const randomTimestamp =
    startTimestamp + Math.random() * (endTimestamp - startTimestamp);

  // Create a new Date object from the random timestamp
  return new Date(randomTimestamp);
}

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
      {
        key: "task_management",
        title: "Task Management",
        description: "Can assign tasks to society members.",
      },
      {
        key: "meeting_management",
        title: "Meeting Management",
        description: "Can initiate and manage video meetings.",
      },
    ],
  });

  if (process.env.NODE_ENV === "development") {
    await seedSocietiesAndAdvisors();
    await seedRoles();
    await seedStudents();
    await seedStudentSocietyMemberships();
    await seedEvents();
    await seedEventRegistrations();
    await seedPaymentTransactions();
    await seedAnnouncements();
    await seedTasks();
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
