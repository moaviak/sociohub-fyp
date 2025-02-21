import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

import logger from "../logger/winston.logger";

interface EmailOptions {
  email: string;
  subject: string;
  mailgenContent: Mailgen.Content;
}

/**
 * @param options Email configuration options
 */
export const sendEmail = async (options: EmailOptions) => {
  // Initialize mailgen instance with default theme and brand configuration
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "SocioHub",
      link: "https://sociohub.app",
    },
  });

  // For more info on how mailgen content work visit https://github.com/eladnava/mailgen#readme
  // Generate the plaintext version of the e-mail (for clients that do not support HTML)
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  // Generate an HTML email with the provided contents
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  // Create a nodemailer transporter instance which is responsible to send a mail
  const transporter = nodemailer.createTransport(
    MailtrapTransport({
      token: process.env.MAILTRAP_API_TOKEN!,
      testInboxId: 3092980,
    })
  );

  const mail = {
    from: '"SocioHub" <info@sociohub.app>', // Use a more professional from address
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
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

/**
 *
 * @param {string} username
 * @param {string} verificationUrl
 * @returns {Mailgen.Content}
 * @description It designs the email verification mail
 */
export const emailVerificationMailgenContent = (
  username: string,
  verificationUrl: string
): Mailgen.Content => {
  return {
    body: {
      name: username,
      intro: "Welcome to our app! We're very excited to have you on board.",
      action: {
        instructions:
          "To verify your email please click on the following button:",
        button: {
          color: "#1a6fcc", // Optional action button color
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};
