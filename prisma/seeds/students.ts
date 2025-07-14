import { faker } from "@faker-js/faker";
import { getRandomDate } from ".";
import * as bcrypt from "bcryptjs";
import prisma from "../../src/db";

export const DEGREES = [
  { value: "BAF" },
  { value: "BAI" },
  { value: "BBA" },
  { value: "BCE" },
  { value: "BCS" },
  { value: "BEE" },
  { value: "BEN" },
  { value: "BSE" },
  { value: "BSM" },
  { value: "PCS" },
  { value: "PEE" },
  { value: "PMS" },
  { value: "PMT" },
  { value: "RCE" },
  { value: "RCS" },
  { value: "REE" },
  { value: "RMS" },
  { value: "RMT" },
  { value: "RPM" },
];

export const seedStudents = async () => {
  const students = [];
  const usedRegistrationNumbers = new Set();

  for (let i = 0; i < 100; i++) {
    const degree = DEGREES[Math.floor(Math.random() * DEGREES.length)].value;
    const semester = Math.random() < 0.5 ? "SP" : "FA"; // Randomly choose SP or FA
    const year = faker.number
      .int({ min: 20, max: 25 })
      .toString()
      .padStart(2, "0"); // Random year between 20-25
    const studentNumber = faker.number
      .int({ min: 1, max: 999 })
      .toString()
      .padStart(3, "0"); // Random 3-digit number

    let registrationNumber;
    // Ensure unique registration numbers
    do {
      registrationNumber = `${semester}${year}-${degree}-${studentNumber}`;
    } while (usedRegistrationNumbers.has(registrationNumber));

    usedRegistrationNumbers.add(registrationNumber);

    students.push({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: `${registrationNumber.toLowerCase()}@cuiatk.edu.pk`,
      registrationNumber,
      password: await bcrypt.hash("12345678", 10),
      createdAt: getRandomDate(new Date("2023-01-01"), new Date("2025-01-01")),
    });
  }

  for (const student of students) {
    await prisma.student.upsert({
      where: { email: student.email },
      update: {},
      create: {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        registrationNumber: student.registrationNumber,
        password: student.password,
        createdAt: student.createdAt,
        isEmailVerified: true,
        avatar: `https://avatar.iran.liara.run/username?username=${student.firstName}+${student.lastName}`,
      },
    });
  }
};
