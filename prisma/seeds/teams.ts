import { faker } from "@faker-js/faker";
import prisma from "../../src/db";
import { getRandomDate } from ".";
import { TeamVisibility, TeamTaskStatus } from "@prisma/client";

export const seedTeams = async () => {
  const societies = await prisma.society.findMany();
  const students = await prisma.student.findMany({ include: { user: true } });

  for (const society of societies) {
    // Get all student members of this society
    const memberships = await prisma.studentSociety.findMany({
      where: { societyId: society.id },
      select: { studentId: true },
    });
    const memberStudentIds = memberships.map((m) => m.studentId);
    const societyStudents = students.filter((s) =>
      memberStudentIds.includes(s.id)
    );
    if (societyStudents.length < 3) continue; // Need at least 3 for a team

    // Each society gets 2-5 teams
    const teamCount = faker.number.int({ min: 2, max: 5 });
    for (let i = 0; i < teamCount; i++) {
      const teamName = `Team ${faker.word.adjective()} ${faker.word.noun()}`;
      const teamDescription = faker.lorem.sentence();
      const visibility = faker.helpers.arrayElement([
        TeamVisibility.PUBLIC,
        TeamVisibility.PRIVATE,
      ]);
      const createdAt = getRandomDate(society.createdAt, new Date());
      // Pick a random lead from members
      const lead = faker.helpers.arrayElement(societyStudents);
      // Pick 3-10 unique members (including lead)
      const teamMembers = faker.helpers.arrayElements(societyStudents, {
        min: 3,
        max: Math.min(10, societyStudents.length),
      });
      if (!teamMembers.includes(lead)) teamMembers[0] = lead;

      // Create the team
      const team = await prisma.team.create({
        data: {
          name: teamName,
          description: teamDescription,
          logo: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(
            teamName
          )}`,
          visibility,
          societyId: society.id,
          leadId: lead.id,
          createdAt,
        },
      });

      // Add members
      for (const member of teamMembers) {
        await prisma.teamMember.create({
          data: {
            teamId: team.id,
            studentId: member.id,
            joinedAt: getRandomDate(createdAt, new Date()),
          },
        });
      }

      // Generate join requests (students not in team)
      const nonMembers = societyStudents.filter(
        (s) => !teamMembers.some((m) => m.id === s.id)
      );
      const joinRequestCount = faker.number.int({
        min: 0,
        max: Math.min(5, nonMembers.length),
      });
      const joinRequestStudents = faker.helpers.arrayElements(nonMembers, {
        min: 0,
        max: joinRequestCount,
      });
      for (const jrStudent of joinRequestStudents) {
        await prisma.teamJoinRequest.create({
          data: {
            teamId: team.id,
            studentId: jrStudent.id,
            status: faker.helpers.arrayElement([
              "PENDING",
              "APPROVED",
              "REJECTED",
            ]),
            message: faker.lorem.sentence(),
            createdAt: getRandomDate(createdAt, new Date()),
            updatedAt: new Date(),
          },
        });
      }

      // Generate invitations (students not in team)
      const invitationCount = faker.number.int({
        min: 0,
        max: Math.min(5, nonMembers.length),
      });
      const invitedStudents = faker.helpers.arrayElements(nonMembers, {
        min: 0,
        max: invitationCount,
      });
      for (const invited of invitedStudents) {
        await prisma.teamInvitation.create({
          data: {
            teamId: team.id,
            studentId: invited.id,
            invitedById: lead.id,
            status: faker.helpers.arrayElement([
              "PENDING",
              "APPROVED",
              "REJECTED",
            ]),
            message: faker.lorem.sentence(),
            createdAt: getRandomDate(createdAt, new Date()),
            updatedAt: new Date(),
          },
        });
      }

      // Generate team tasks
      const taskCount = faker.number.int({ min: 2, max: 8 });
      for (let t = 0; t < taskCount; t++) {
        const assignedBy = faker.helpers.arrayElement(teamMembers);
        await prisma.teamTask.create({
          data: {
            title: faker.lorem.words({ min: 2, max: 5 }),
            description: faker.lorem.sentence(),
            dueDate: faker.date.soon({ days: 60 }),
            status: faker.helpers.arrayElement([
              TeamTaskStatus.TO_DO,
              TeamTaskStatus.IN_PROGRESS,
              TeamTaskStatus.COMPLETED,
              TeamTaskStatus.CANCELLED,
            ]),
            teamId: team.id,
            assignedById: assignedBy.id,
            createdAt: getRandomDate(createdAt, new Date()),
            updatedAt: new Date(),
          },
        });
      }
    }
  }
};

seedTeams()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
