import { faker } from "@faker-js/faker";
import prisma from "../../src/db";
import * as QRCode from "qrcode";

const REGISTRATION_STATUSES = ["PENDING", "APPROVED", "DECLINED"];

const generateQRCode = (payload: {
  registrationId: string;
  eventId: string;
  studentId: string;
  societyId: string;
}) => {
  // Generate QR code data as JSON string
  return QRCode.toDataURL(JSON.stringify(payload));
};

const shouldRegister = (event: any, student: any) => {
  // Higher registration rate for:
  // - Open events (90%)
  // - Member events for society members (95%)
  // - Invite events (70%)
  // - Completed events have higher registration rates than upcoming

  const baseRate =
    event.audience === "Open" ? 0.9 : event.audience === "Members" ? 0.95 : 0.7;

  // Adjust based on event status
  const statusMultiplier =
    event.status === "Completed"
      ? 1.2
      : event.status === "Ongoing"
      ? 1.1
      : event.status === "Upcoming"
      ? 1.0
      : 0.3; // Cancelled events

  return Math.random() < baseRate * statusMultiplier;
};

const getRegistrationStatus = (event: any, registrationDate: Date) => {
  // For completed events, most registrations should be approved
  if (event.status === "Completed") {
    return faker.helpers.weightedArrayElement([
      { weight: 85, value: "APPROVED" },
      { weight: 10, value: "DECLINED" },
      { weight: 5, value: "PENDING" },
    ]);
  }

  // For upcoming events, mix of statuses
  if (event.status === "Upcoming") {
    return faker.helpers.weightedArrayElement([
      { weight: 60, value: "APPROVED" },
      { weight: 20, value: "PENDING" },
      { weight: 20, value: "DECLINED" },
    ]);
  }

  // For ongoing events, mostly approved
  if (event.status === "Ongoing") {
    return faker.helpers.weightedArrayElement([
      { weight: 80, value: "APPROVED" },
      { weight: 15, value: "PENDING" },
      { weight: 5, value: "DECLINED" },
    ]);
  }

  // For cancelled events, mostly declined
  return faker.helpers.weightedArrayElement([
    { weight: 10, value: "APPROVED" },
    { weight: 20, value: "PENDING" },
    { weight: 70, value: "DECLINED" },
  ]);
};

const shouldTicketBeScanned = (event: any, registrationStatus: string) => {
  if (registrationStatus !== "APPROVED") return false;
  if (event.status !== "Completed" && event.status !== "Ongoing") return false;

  // 70% of approved registrations for completed/ongoing events are scanned
  return Math.random() < 0.7;
};

export const seedEventRegistrations = async () => {
  const students = await prisma.student.findMany();
  const events = await prisma.event.findMany({
    where: {
      registrationRequired: true,
      isDraft: false,
    },
    include: {
      society: true,
    },
  });

  // Get society memberships for filtering
  const societyMemberships = await prisma.studentSociety.findMany({
    select: {
      studentId: true,
      societyId: true,
    },
  });

  const membershipMap = new Map();
  societyMemberships.forEach((membership) => {
    if (!membershipMap.has(membership.studentId)) {
      membershipMap.set(membership.studentId, new Set());
    }
    membershipMap.get(membership.studentId).add(membership.societyId);
  });

  for (const event of events) {
    const potentialRegistrants = students.filter((student) => {
      // For member-only events, only society members can register
      if (event.audience === "Members") {
        const studentSocieties = membershipMap.get(student.id);
        return studentSocieties && studentSocieties.has(event.societyId);
      }
      return true;
    });

    // Calculate target registrations
    let targetRegistrations;
    if (event.maxParticipants) {
      // For events with max participants, register 80-120% of capacity
      const multiplier = faker.number.float({ min: 0.8, max: 1.2 });
      targetRegistrations = Math.floor(event.maxParticipants * multiplier);
    } else {
      // For events without max, register 30-80% of potential registrants
      const multiplier = faker.number.float({ min: 0.3, max: 0.8 });
      targetRegistrations = Math.floor(
        potentialRegistrants.length * multiplier
      );
    }

    // Ensure minimum registrations for paid events to meet payment transaction requirement
    if (event.paidEvent && targetRegistrations < 50) {
      targetRegistrations = Math.min(50, potentialRegistrants.length);
    }

    // Shuffle potential registrants
    const shuffledRegistrants = faker.helpers.shuffle(potentialRegistrants);

    // Select registrants
    const selectedRegistrants = shuffledRegistrants.slice(
      0,
      Math.min(targetRegistrations, shuffledRegistrants.length)
    );

    for (const student of selectedRegistrants) {
      if (!shouldRegister(event, student)) continue;

      let fromDate, toDate;
      if (event.status === "Completed") {
        fromDate = new Date(
          Math.max(event.createdAt.getTime(), new Date("2023-06-01").getTime())
        );
        toDate = new Date(event.startDate!.getTime() - 24 * 60 * 60 * 1000);
      } else {
        fromDate = new Date(
          Math.max(event.createdAt.getTime(), new Date("2023-06-01").getTime())
        );
        toDate = new Date();
      }
      if (fromDate >= toDate) {
        // fallback: set fromDate to a day before toDate
        fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);
      }
      const registrationDate = faker.date.between({
        from: fromDate,
        to: toDate,
      });

      const status = getRegistrationStatus(event, registrationDate);

      // Create registration
      const registration = await prisma.eventRegistration.create({
        data: {
          studentId: student.id,
          eventId: event.id,
          registeredAt: registrationDate,
          status: status as any,
        },
      });

      // Create ticket only for physical events with approved registrations
      if (event.eventType === "Physical" && status === "APPROVED") {
        const qrPayload = {
          registrationId: registration.id,
          eventId: event.id,
          studentId: student.id,
          societyId: event.societyId,
        };

        const qrCode = await generateQRCode(qrPayload);
        const isScanned = shouldTicketBeScanned(event, status);

        let scannedAt = null;
        let scannedBy = null;

        if (isScanned) {
          // Get a random student from the same society to be the scanner (admin)
          const societyMembers = await prisma.studentSociety.findMany({
            where: { societyId: event.societyId },
            select: { studentId: true },
          });

          if (societyMembers.length > 0) {
            scannedBy = faker.helpers.arrayElement(societyMembers).studentId;
            scannedAt = faker.date.between({
              from: event.startDate!,
              to: event.endDate!,
            });
          }
        }

        await prisma.eventTicket.create({
          data: {
            registrationId: registration.id,
            qrCode,
            issuedAt: faker.date.between({
              from: registrationDate,
              to: event.startDate!,
            }),
            scannedAt,
            isScanned,
            scannedBy,
          },
        });
      }
    }
  }
};

seedEventRegistrations()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
