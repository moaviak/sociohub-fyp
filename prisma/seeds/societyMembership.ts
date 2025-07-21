import { getRandomDate } from ".";
import prisma from "../../src/db";

export const seedStudentSocietyMemberships = async () => {
  // Get all students and societies
  const students = await prisma.student.findMany({ include: { user: true } });
  const societies = await prisma.society.findMany();

  // Shuffle students array for random assignment
  const shuffledStudents = [...students].sort(() => Math.random() - 0.5);

  // Track students with privileged roles
  const studentsWithPrivilegedRoles = new Set();

  // Track how many societies each student is in
  const studentSocietyCount = new Map();

  // Initialize student society count
  students.forEach((student) => {
    studentSocietyCount.set(student.id, 0);
  });

  // For each society, assign privileged roles first
  for (const society of societies) {
    // Get roles specific to this society
    const societyRoles = await prisma.role.findMany({
      where: { societyId: society.id },
    });

    const memberRole = societyRoles.find((role) => role.name === "Member");
    const privilegedRoles = societyRoles.filter((role) =>
      [
        "President",
        "Vice President",
        "General Secretary",
        "Treasurer",
      ].includes(role.name)
    );

    if (!memberRole) {
      throw new Error(`Member role not found for society ${society.name}`);
    }

    if (privilegedRoles.length !== 4) {
      throw new Error(
        `All privileged roles not found for society ${society.name}. Found ${privilegedRoles.length}, expected 4`
      );
    }

    const availableStudents = shuffledStudents.filter(
      (student) =>
        !studentsWithPrivilegedRoles.has(student.id) &&
        studentSocietyCount.get(student.id) < 2
    );

    if (availableStudents.length < 4) {
      throw new Error(
        `Not enough available students for society ${society.name}`
      );
    }

    // Assign privileged roles
    for (let i = 0; i < 4; i++) {
      const student = availableStudents[i];
      const role = privilegedRoles[i];

      // Create StudentSociety membership
      await prisma.studentSociety.create({
        data: {
          studentId: student.id,
          societyId: society.id,
          interestedRoleId: role.id,
          createdAt: getRandomDate(society.createdAt, new Date()),
        },
      });

      // Create StudentSocietyRole for privileged role
      await prisma.studentSocietyRole.create({
        data: {
          studentId: student.id,
          societyId: society.id,
          roleId: role.id,
        },
      });

      // Create StudentSocietyRole for member role as well
      await prisma.studentSocietyRole.create({
        data: {
          studentId: student.id,
          societyId: society.id,
          roleId: memberRole.id,
        },
      });

      // Add student to society group chat - THIS WAS MISSING
      await prisma.chat.update({
        where: { societyId: society.id },
        data: { participants: { connect: { id: student.user!.id } } },
      });

      studentsWithPrivilegedRoles.add(student.id);
      studentSocietyCount.set(
        student.id,
        studentSocietyCount.get(student.id) + 1
      );
    }
  }

  // Now assign remaining students to societies as regular members
  for (const student of shuffledStudents) {
    const currentSocietyCount = studentSocietyCount.get(student.id);

    if (currentSocietyCount < 2) {
      // Shuffle societies for random assignment
      const shuffledSocieties = [...societies].sort(() => Math.random() - 0.5);

      // Get societies the student is not already in
      const existingMemberships = await prisma.studentSociety.findMany({
        where: { studentId: student.id },
        select: { societyId: true },
      });

      const existingSocietyIds = new Set(
        existingMemberships.map((m) => m.societyId)
      );
      const availableSocieties = shuffledSocieties.filter(
        (society) => !existingSocietyIds.has(society.id)
      );

      // Assign to 1 or 2 societies based on current count
      const societiesToAssign = Math.min(
        2 - currentSocietyCount,
        availableSocieties.length
      );

      for (let i = 0; i < societiesToAssign; i++) {
        const society = availableSocieties[i];

        // Get the member role for this specific society
        const societyRoles = await prisma.role.findMany({
          where: { societyId: society.id },
        });
        const memberRole = societyRoles.find((role) => role.name === "Member");

        if (!memberRole) {
          throw new Error(`Member role not found for society ${society.name}`);
        }

        // Create StudentSociety membership
        await prisma.studentSociety.create({
          data: {
            studentId: student.id,
            societyId: society.id,
            interestedRoleId: memberRole.id,
            createdAt: getRandomDate(society.createdAt, new Date()),
          },
        });

        // Create StudentSocietyRole for member role
        await prisma.studentSocietyRole.create({
          data: {
            studentId: student.id,
            societyId: society.id,
            roleId: memberRole.id,
          },
        });

        // Add student to society group
        await prisma.chat.update({
          where: { societyId: society.id },
          data: { participants: { connect: { id: student.user!.id } } },
        });

        studentSocietyCount.set(
          student.id,
          studentSocietyCount.get(student.id) + 1
        );
      }
    }
  }
};

seedStudentSocietyMemberships()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
