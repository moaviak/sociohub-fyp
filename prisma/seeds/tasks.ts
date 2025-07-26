import { faker } from "@faker-js/faker";
import { getRandomDate } from ".";
import prisma from "../../src/db";

const STUDENT_TASK_DESCRIPTIONS = [
  "Complete membership registration form",
  "Attend upcoming society meeting",
  "Submit project proposal for review",
  "Prepare presentation for next workshop",
  "Update personal profile information",
  "Pay membership dues",
  "Volunteer for upcoming event",
  "Review and approve event budget",
  "Coordinate with team members",
  "Finalize event venue booking",
  "Create promotional materials",
  "Send meeting invitations",
  "Prepare monthly activity report",
  "Organize committee meeting",
  "Review society constitution",
  "Update society website content",
  "Collect feedback from members",
  "Plan networking session",
  "Coordinate with guest speakers",
  "Manage event registrations",
  "Prepare welcome kit for new members",
  "Submit expense reimbursement",
  "Follow up on pending applications",
  "Schedule equipment setup",
  "Create event timeline",
  "Distribute meeting minutes",
  "Confirm event catering arrangements",
  "Update member contact list",
  "Prepare society annual report",
  "Coordinate transportation for event",
];

const ADVISOR_TASK_DESCRIPTIONS = [
  "Review and approve event proposal",
  "Conduct monthly society evaluation",
  "Prepare advisory meeting agenda",
  "Review student society budget",
  "Approve membership applications",
  "Provide guidance on event planning",
  "Review society constitution changes",
  "Evaluate society performance metrics",
  "Mentor society executive committee",
  "Approve venue booking requests",
  "Review financial statements",
  "Conduct society audit",
  "Prepare semester report",
  "Coordinate with university administration",
  "Review society activity calendar",
  "Provide feedback on proposals",
  "Evaluate society compliance",
  "Approve equipment purchases",
  "Review society policies",
  "Conduct leadership training",
  "Assess society goals achievement",
  "Approve external partnerships",
  "Review society marketing materials",
  "Evaluate member satisfaction",
  "Coordinate inter-society activities",
  "Review society improvement plans",
  "Approve special event requests",
  "Conduct society orientation",
  "Review society bylaws",
  "Evaluate society impact assessment",
];

const SOCIETY_ASSIGNED_TASKS = [
  "Organize monthly general meeting",
  "Plan society annual dinner",
  "Create recruitment campaign",
  "Develop society branding materials",
  "Coordinate community service project",
  "Organize skills development workshop",
  "Plan inter-society collaboration event",
  "Develop society newsletter",
  "Organize fundraising campaign",
  "Create society promotional video",
  "Plan society retreat",
  "Organize alumni networking event",
  "Develop society mobile app",
  "Create society merchandise",
  "Plan society competition",
  "Organize society exhibition",
  "Develop society website",
  "Plan society conference",
  "Organize society sports tournament",
  "Create society social media content",
  "Plan society awards ceremony",
  "Organize society field trip",
  "Develop society training program",
  "Create society handbook",
  "Plan society open house",
  "Organize society debate competition",
  "Develop society research project",
  "Create society mentorship program",
  "Plan society cultural festival",
  "Organize society tech seminar",
];

export const seedTasks = async () => {
  const students = await prisma.student.findMany();
  const advisors = await prisma.advisor.findMany();
  const societies = await prisma.society.findMany();

  // Get student society memberships
  const studentMemberships = await prisma.studentSociety.findMany({
    select: {
      studentId: true,
      societyId: true,
    },
  });

  const membershipMap = new Map();
  studentMemberships.forEach((membership) => {
    if (!membershipMap.has(membership.studentId)) {
      membershipMap.set(membership.studentId, []);
    }
    membershipMap.get(membership.studentId).push(membership.societyId);
  });

  // Create tasks for students
  for (const student of students) {
    const taskCount = faker.number.int({ min: 5, max: 10 });
    const studentSocieties = membershipMap.get(student.id) || [];

    for (let i = 0; i < taskCount; i++) {
      const isStarred = faker.datatype.boolean({ probability: 0.2 }); // 20% chance
      const isCompleted = faker.datatype.boolean({ probability: 0.6 }); // 60% chance

      const createdAt = getRandomDate(student.createdAt, new Date());
      const updatedAt = isCompleted
        ? faker.date.between({ from: createdAt, to: new Date() })
        : createdAt;

      // Decide if task is assigned by society (50% chance) or personal task
      let assignedBySocietyId: null | string = null;
      let description = faker.helpers.arrayElement(STUDENT_TASK_DESCRIPTIONS);

      if (
        studentSocieties.length > 0 &&
        faker.datatype.boolean({ probability: 0.5 })
      ) {
        assignedBySocietyId = faker.helpers.arrayElement(studentSocieties);
        description = faker.helpers.arrayElement(SOCIETY_ASSIGNED_TASKS);
      }

      await prisma.task.create({
        data: {
          description,
          isStarred,
          isCompleted,
          createdAt,
          updatedAt,
          createdByStudentId: student.id,
          createdByAdvisorId: null,
          assignedBySocietyId: assignedBySocietyId!,
        },
      });
    }
  }

  // Create tasks for advisors
  for (const advisor of advisors) {
    const taskCount = faker.number.int({ min: 5, max: 10 });

    for (let i = 0; i < taskCount; i++) {
      const isStarred = faker.datatype.boolean({ probability: 0.3 }); // 30% chance
      const isCompleted = faker.datatype.boolean({ probability: 0.7 }); // 70% chance

      const createdAt = getRandomDate(advisor.createdAt, new Date());
      const updatedAt = isCompleted
        ? faker.date.between({ from: createdAt, to: new Date() })
        : createdAt;

      // Decide if task is assigned by society (40% chance) or personal task
      let assignedBySocietyId: string | null = null;
      let description = faker.helpers.arrayElement(ADVISOR_TASK_DESCRIPTIONS);

      if (faker.datatype.boolean({ probability: 0.4 })) {
        assignedBySocietyId = faker.helpers.arrayElement(societies).id;
        description = faker.helpers.arrayElement(SOCIETY_ASSIGNED_TASKS);
      }

      await prisma.task.create({
        data: {
          description,
          isStarred,
          isCompleted,
          createdAt,
          updatedAt,
          createdByStudentId: null,
          createdByAdvisorId: advisor.id,
          assignedBySocietyId,
        },
      });
    }
  }

  // Create some additional society-assigned tasks for random students
  const additionalTasks = faker.number.int({ min: 50, max: 100 });

  for (let i = 0; i < additionalTasks; i++) {
    const society = faker.helpers.arrayElement(societies);
    const societyMembers = membershipMap.entries();
    const membersArray = Array.from(societyMembers).filter(
      ([studentId, societyIds]) => societyIds.includes(society.id)
    );

    if (membersArray.length > 0) {
      const [randomStudentId] = faker.helpers.arrayElement(membersArray);

      const isStarred = faker.datatype.boolean({ probability: 0.25 }); // 25% chance
      const isCompleted = faker.datatype.boolean({ probability: 0.5 }); // 50% chance

      const createdAt = getRandomDate(new Date("2023-06-01"), new Date());
      const updatedAt = isCompleted
        ? faker.date.between({ from: createdAt, to: new Date() })
        : createdAt;

      await prisma.task.create({
        data: {
          description: faker.helpers.arrayElement(SOCIETY_ASSIGNED_TASKS),
          isStarred,
          isCompleted,
          createdAt,
          updatedAt,
          createdByStudentId: randomStudentId,
          createdByAdvisorId: null,
          assignedBySocietyId: society.id,
        },
      });
    }
  }
};
