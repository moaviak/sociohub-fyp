import { faker } from "@faker-js/faker";
import prisma from "../../src/db";

const PAYMENT_STATUSES = ["PENDING", "COMPLETED", "FAILED", "CANCELLED"];
const PAYMENT_METHODS = ["CARD", "BANK_TRANSFER"];

const generateStripeSessionId = () => {
  return `cs_test_${faker.string.alphanumeric(50)}`;
};

const generateStripePaymentIntentId = () => {
  return `pi_${faker.string.alphanumeric(24)}`;
};

const generateStripeTransferId = () => {
  return `tr_${faker.string.alphanumeric(24)}`;
};

const getPaymentStatus = (event: any, registrationStatus: string) => {
  // If registration is declined, payment should be failed/cancelled
  if (registrationStatus === "DECLINED") {
    return faker.helpers.weightedArrayElement([
      { weight: 60, value: "FAILED" },
      { weight: 40, value: "CANCELLED" },
    ]);
  }

  // For completed events, most payments should be completed
  if (event.status === "Completed") {
    return faker.helpers.weightedArrayElement([
      { weight: 85, value: "COMPLETED" },
      { weight: 8, value: "FAILED" },
      { weight: 5, value: "CANCELLED" },
      { weight: 2, value: "PENDING" },
    ]);
  }

  // For upcoming events
  if (event.status === "Upcoming") {
    return faker.helpers.weightedArrayElement([
      { weight: 70, value: "COMPLETED" },
      { weight: 15, value: "PENDING" },
      { weight: 10, value: "FAILED" },
      { weight: 5, value: "CANCELLED" },
    ]);
  }

  // For ongoing events
  if (event.status === "Ongoing") {
    return faker.helpers.weightedArrayElement([
      { weight: 80, value: "COMPLETED" },
      { weight: 10, value: "PENDING" },
      { weight: 7, value: "FAILED" },
      { weight: 3, value: "CANCELLED" },
    ]);
  }

  // For cancelled events
  return faker.helpers.weightedArrayElement([
    { weight: 20, value: "COMPLETED" },
    { weight: 20, value: "PENDING" },
    { weight: 30, value: "FAILED" },
    { weight: 30, value: "CANCELLED" },
  ]);
};

const calculateApplicationFee = (amount: number) => {
  // 2.5% application fee + 30 PKR fixed fee
  return Math.round(amount * 0.025 + 30);
};

const calculateTransferAmount = (amount: number, applicationFee: number) => {
  return amount - applicationFee;
};

const generatePaymentMetadata = (event: any, student: any) => {
  return {
    event_title: event.title,
    event_id: event.id,
    society_name: event.society?.name || "Unknown Society",
    student_name: `${student.firstName} ${student.lastName}`,
    student_email: student.email,
    registration_number: student.registrationNumber,
    event_date: event.startDate,
    event_type: event.eventType,
    event_category: event.categories[0] || "Other",
  };
};

export const seedPaymentTransactions = async () => {
  // Get all registrations for paid events
  const paidEventRegistrations = await prisma.eventRegistration.findMany({
    where: {
      event: {
        paidEvent: true,
        ticketPrice: {
          not: null,
        },
      },
    },
    include: {
      event: {
        include: {
          society: true,
        },
      },
      student: true,
    },
  });

  console.log(
    `Found ${paidEventRegistrations.length} registrations for paid events`
  );

  for (const registration of paidEventRegistrations) {
    const { event, student } = registration;

    if (!event.ticketPrice) continue;

    const paymentStatus = getPaymentStatus(event, registration.status);
    const paymentMethod = faker.helpers.arrayElement(PAYMENT_METHODS);

    // Generate payment date
    let paymentDate: Date;
    if (registration.registeredAt) {
      // Payment usually happens within 1 hour of registration
      paymentDate = faker.date.between({
        from: registration.registeredAt,
        to: new Date(registration.registeredAt.getTime() + 60 * 60 * 1000),
      });
    } else {
      // Fallback if registeredAt is null
      paymentDate = faker.date.between({
        from: event.createdAt,
        to: event.startDate!,
      });
    }

    const applicationFee = calculateApplicationFee(event.ticketPrice);
    const transferAmount = calculateTransferAmount(
      event.ticketPrice,
      applicationFee
    );

    // For completed payments, set paidAt
    let paidAt: Date | null = null;
    if (paymentStatus === "COMPLETED") {
      paidAt = paymentDate;
    }

    // Generate Stripe IDs for realistic data
    const stripeCheckoutSessionId = generateStripeSessionId();
    const stripePaymentIntentId =
      paymentStatus === "COMPLETED" ? generateStripePaymentIntentId() : null;
    const stripeTransferId =
      paymentStatus === "COMPLETED" ? generateStripeTransferId() : null;

    const metadata = generatePaymentMetadata(event, student);

    const description = `Payment for ${event.title} - ${
      event.society?.name || "Society"
    }`;

    await prisma.paymentTransaction.create({
      data: {
        eventId: event.id,
        studentId: student.id,
        registrationId: registration.id,
        stripeCheckoutSessionId,
        stripePaymentIntentId,
        stripeTransferId,
        amount: event.ticketPrice,
        currency: "PKR",
        paymentMethod: paymentMethod as any,
        status: paymentStatus as any,
        description,
        receiptEmail: student.email,
        metadata,
        applicationFeeAmount: applicationFee,
        transferAmount,
        paidAt,
        createdAt: paymentDate,
        updatedAt: paymentStatus === "COMPLETED" ? paidAt! : paymentDate,
      },
    });
  }

  console.log(`Created ${paidEventRegistrations.length} payment transactions`);
};
