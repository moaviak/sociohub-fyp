import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";
import ejs from "ejs";
import path from "path";

import logger from "../logger/winston.logger";

interface EmailOptions {
  email: string | string[];
  subject: string;
  template: string;
  data: Record<string, any>;
}

interface VerificationEmailData {
  displayName: string;
  verificationCode: string;
  userType: "student" | "advisor";
}

interface RequestApprovalEmailData {
  studentName: string;
  societyName: string;
  roleName: string;
}

interface RequestRejectionEmailData {
  studentName: string;
  societyName: string;
  rejectionReason?: string;
}

interface MemberRemovalEmailData {
  studentName: string;
  societyName: string;
  reason?: string;
}

interface RoleAssignmentEmailData {
  studentName: string;
  societyName: string;
  societyId: string;
  roleName: string;
  roleDescription?: string;
  privileges?: string[];
}

interface EventRegistrationConfirmationEmailData {
  studentName: string;
  eventTitle: string;
  eventStartDate: string;
  eventEndDate: string;
  eventStartTime?: string;
  eventEndTime?: string;
  eventVenue?: string;
  eventType: string;
  societyName: string;
  ticketQrCode?: string;
  entryInstructions?: string;
  platform?: string;
  meetingLink?: string;
  accessInstructions?: string;
}

interface PaymentConfirmationEmailData {
  studentName: string;
  eventTitle: string;
  amountPaid: string;
  paymentDate: string;
  eventDate?: string;
  eventVenue?: string;
}

/**
 * @param options Email configuration options
 */
export const sendEmail = async (options: EmailOptions) => {
  const transporter =
    process.env.NODE_ENV === "production"
      ? nodemailer.createTransport({
          host: Array.isArray(options.email)
            ? "bulk.smtp.mailtrap.io"
            : "live.smtp.mailtrap.io",
          port: parseInt(process.env.MAILTRAP_SMTP_PORT!),
          auth: {
            user: process.env.MAILTRAP_SMTP_USER!,
            pass: process.env.MAILTRAP_SMTP_PASS!,
          },
        })
      : nodemailer.createTransport(
          MailtrapTransport({
            token: process.env.MAILTRAP_API_TOKEN!,
            testInboxId: 3092980,
          })
        );

  // Render email template
  const templatePath = path.join(
    __dirname,
    "../views/emails",
    options.template
  );
  const html = await ejs.renderFile(templatePath, options.data);

  const mail = {
    from: '"SocioHub" <info@sociohub.app>',
    to: options.email,
    subject: options.subject,
    html,
    sandbox: true,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    // As sending email is not strongly coupled to the business logic it is not worth to raise an error when email sending fails
    // So it's better to fail silently rather than breaking the app
    logger.error(
      "Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file"
    );
    logger.error("Error: ", error);
  }
};

export const sendVerificationEmail = async (
  email: string,
  data: VerificationEmailData
) => {
  await sendEmail({
    email,
    subject: "Verify your email",
    template: "verification.ejs",
    data,
  });
};

export const sendRequestApprovalEmail = async (
  email: string,
  data: RequestApprovalEmailData
) => {
  await sendEmail({
    email,
    subject: `Welcome to ${data.societyName}!`,
    template: "request-approved.ejs",
    data,
  });
};

export const sendRequestRejectionEmail = async (
  email: string,
  data: RequestRejectionEmailData
) => {
  await sendEmail({
    email,
    subject: `Update on your request to join ${data.societyName}`,
    template: "request-rejected.ejs",
    data,
  });
};

export const sendMemberRemovalEmail = async (
  email: string,
  data: MemberRemovalEmailData
) => {
  await sendEmail({
    email,
    subject: `Important: Update on your ${data.societyName} membership`,
    template: "member-removed.ejs",
    data,
  });
};

export const sendRoleAssignmentEmail = async (
  emails: string | string[],
  data: RoleAssignmentEmailData
) => {
  await sendEmail({
    email: emails,
    subject: `Role Assignment: ${data.roleName} in ${data.societyName}`,
    template: "role-assigned.ejs",
    data,
  });
};

export const sendEventRegistrationConfirmationEmail = async (
  email: string,
  data: EventRegistrationConfirmationEmailData
) => {
  await sendEmail({
    email,
    subject: `Registration Confirmed: ${data.eventTitle}`,
    template: "event-registration-confirmation.ejs",
    data,
  });
};

export const sendPaymentConfirmationEmail = async (
  email: string,
  data: PaymentConfirmationEmailData
) => {
  await sendEmail({
    email,
    subject: `Payment Confirmation for ${data.eventTitle}`,
    template: "payment-confirmation.ejs",
    data,
  });
};
