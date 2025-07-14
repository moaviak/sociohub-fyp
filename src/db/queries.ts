import prisma from ".";

export const DEGREES = [
  "BAF",
  "BAI",
  "BBA",
  "BCE",
  "BCS",
  "BEE",
  "BEN",
  "BSE",
  "BSM",
  "PCS",
  "PEE",
  "PMS",
  "PMT",
  "RCE",
  "RCS",
  "REE",
  "RMS",
  "RMT",
  "RPM",
];

export const updateStudentRegistrationNumbers = async () => {
  // Get all students
  const students = await prisma.student.findMany({
    select: {
      id: true,
      registrationNumber: true,
      email: true,
    },
  });

  const usedRegistrationNumbers = new Set();
  const updates = [];

  for (const student of students) {
    // Extract degree from current registration number (assuming it's in the middle)
    const currentRegParts = student.registrationNumber.split("-");
    let degree =
      currentRegParts[1] || DEGREES[Math.floor(Math.random() * DEGREES.length)];

    // If degree is not valid, pick a random one
    if (!DEGREES.includes(degree)) {
      degree = DEGREES[Math.floor(Math.random() * DEGREES.length)];
    }

    const semester = Math.random() < 0.5 ? "SP" : "FA";
    const year = (20 + Math.floor(Math.random() * 6))
      .toString()
      .padStart(2, "0"); // 20-25

    let registrationNumber;
    let attempts = 0;

    // Generate unique registration number
    do {
      const studentNumber = (Math.floor(Math.random() * 99) + 1)
        .toString()
        .padStart(3, "0");
      registrationNumber = `${semester}${year}-${degree}-${studentNumber}`;
      attempts++;

      // Failsafe to prevent infinite loop
      if (attempts > 1000) {
        throw new Error(
          `Unable to generate unique registration number for student ${student.id}`
        );
      }
    } while (usedRegistrationNumbers.has(registrationNumber));

    usedRegistrationNumbers.add(registrationNumber);

    const newEmail = `${registrationNumber.toLowerCase()}@cuiatk.edu.pk`;

    updates.push({
      id: student.id,
      registrationNumber,
      email: newEmail,
    });
  }

  // Perform batch update
  console.log(`Updating ${updates.length} students...`);

  for (const update of updates) {
    await prisma.student.update({
      where: { id: update.id },
      data: {
        registrationNumber: update.registrationNumber,
        email: update.email,
      },
    });

    console.log(
      `Updated student ${update.id}: ${update.registrationNumber} -> ${update.email}`
    );
  }

  console.log("All students updated successfully!");
};

export const verifyEmails = async () => {
  await prisma.student.updateMany({
    data: { isEmailVerified: true },
  });
};

async function main() {
  await verifyEmails();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    // 5
    await prisma.$disconnect();
    process.exit(1);
  });
