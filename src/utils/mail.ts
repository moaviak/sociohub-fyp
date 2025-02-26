import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";
import ejs from "ejs";
import path from "path";

import logger from "../logger/winston.logger";

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

interface VerificationEmailData {
  username: string;
  verificationCode: string;
  userType: "student" | "advisor";
}

/**
 * @param options Email configuration options
 */
export const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport(
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
