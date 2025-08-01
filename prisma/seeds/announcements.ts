import { faker } from "@faker-js/faker";
import { getRandomDate } from ".";
import prisma from "../../src/db";

const ANNOUNCEMENT_STATUSES = ["Publish", "Schedule"];
const ANNOUNCEMENT_AUDIENCES = ["All", "Members"];

const generateAnnouncementTitle = (type: string, societyName: string) => {
  const titles = {
    general: [
      `${societyName} - Important Update`,
      `${societyName} General Announcement`,
      `Message from ${societyName}`,
      `${societyName} Community Update`,
      `News from ${societyName}`,
      `${societyName} - Latest Updates`,
    ],
    event: [
      `Event Announcement - `,
      `Upcoming Event - `,
      `Don't Miss - `,
      `Join Us for - `,
      `Save the Date - `,
      `Event Alert - `,
    ],
    meeting: [
      `${societyName} Meeting Notice`,
      `Important Meeting Announcement`,
      `Meeting Schedule Update`,
      `Committee Meeting Notice`,
      `General Meeting Announcement`,
    ],
    registration: [
      `Registration Now Open`,
      `Sign Up Today`,
      `Registration Deadline Reminder`,
      `Last Chance to Register`,
      `Registration Extended`,
    ],
    achievement: [
      `${societyName} Achievement`,
      `Congratulations Team`,
      `Success Story`,
      `Achievement Unlocked`,
      `Proud Moment for ${societyName}`,
    ],
    deadline: [
      `Important Deadline`,
      `Reminder: Deadline Approaching`,
      `Final Notice`,
      `Time Sensitive`,
      `Deadline Alert`,
    ],
  };

  const typeTitle = titles[type as keyof typeof titles] || titles.general;
  return faker.helpers.arrayElement(typeTitle);
};

const generateAnnouncementContent = (type: string, societyName: string) => {
  const contents = {
    general: [
      `Dear ${societyName} community,\n\nWe hope this message finds you well. We wanted to share some important updates with you regarding our upcoming activities and initiatives.\n\n${faker.lorem.paragraphs(
        2
      )}\n\nThank you for your continued support and participation.\n\nBest regards,\n${societyName} Team`,
      `Hello everyone,\n\n${faker.lorem.paragraph()}\n\nWe encourage all members to actively participate in our upcoming activities. Your involvement is crucial for the success of our society.\n\n${faker.lorem.paragraph()}\n\nStay tuned for more updates!\n\nRegards,\n${societyName}`,
      `Greetings ${societyName} members,\n\n${faker.lorem.paragraphs(
        3
      )}\n\nWe look forward to your active participation and support.\n\nBest wishes,\n${societyName} Executive Committee`,
    ],
    event: [
      `We are excited to announce our upcoming event! ${faker.lorem.paragraph()}\n\nEvent Details:\n• Date: ${faker.date
        .future()
        .toLocaleDateString()}\n• Time: ${faker.number.int({
        min: 9,
        max: 17,
      })}:00\n• Venue: ${faker.helpers.arrayElement([
        "Main Auditorium",
        "Conference Room",
        "Library Hall",
      ])}\n\n${faker.lorem.paragraph()}\n\nDon't miss this opportunity to learn and network with fellow students!`,
      `Mark your calendars! ${faker.lorem.sentence()}\n\n${faker.lorem.paragraph()}\n\nRegistration is now open. Limited seats available, so register early to secure your spot.\n\nFor more information and registration, please contact us.\n\nSee you there!`,
      `Join us for an exciting event! ${faker.lorem.paragraph()}\n\nWhat to expect:\n• ${faker.lorem.sentence()}\n• ${faker.lorem.sentence()}\n• ${faker.lorem.sentence()}\n\n${faker.lorem.paragraph()}\n\nRefreshments will be provided.`,
    ],
    meeting: [
      `This is to inform all members about our upcoming meeting.\n\nAgenda:\n• ${faker.lorem.sentence()}\n• ${faker.lorem.sentence()}\n• ${faker.lorem.sentence()}\n\nYour presence is highly valued. Please confirm your attendance.\n\nThank you.`,
      `Dear members,\n\nWe will be holding a meeting to discuss important matters concerning our society. ${faker.lorem.paragraph()}\n\nPlease make sure to attend this important session.\n\nRegards,\nExecutive Committee`,
      `Meeting Notice:\n\n${faker.lorem.paragraph()}\n\nAll members are requested to attend. If you cannot make it, please inform us in advance.\n\nThank you for your cooperation.`,
    ],
    registration: [
      `Registration is now open for our upcoming activities! ${faker.lorem.paragraph()}\n\nHow to register:\n• ${faker.lorem.sentence()}\n• ${faker.lorem.sentence()}\n\nDeadline: ${faker.date
        .future()
        .toLocaleDateString()}\n\nDon't wait - register today!`,
      `Limited spots available! ${faker.lorem.paragraph()}\n\nRegistration closes soon. Make sure to secure your place before it's too late.\n\n${faker.lorem.paragraph()}`,
      `Final call for registration! ${faker.lorem.sentence()}\n\n${faker.lorem.paragraph()}\n\nThis is your last chance to be part of this amazing opportunity.`,
    ],
    achievement: [
      `We are proud to announce that ${societyName} has achieved a significant milestone! ${faker.lorem.paragraph()}\n\nThis success is a result of the hard work and dedication of all our members.\n\n${faker.lorem.paragraph()}\n\nCongratulations to everyone involved!`,
      `Great news! ${faker.lorem.sentence()}\n\n${faker.lorem.paragraph()}\n\nWe couldn't have done it without the support of our amazing community.\n\nThank you all for making this possible!`,
      `Achievement unlocked! ${faker.lorem.paragraph()}\n\nThis is just the beginning. We have many more exciting projects and initiatives planned.\n\nStay tuned for more updates!`,
    ],
    deadline: [
      `Important reminder: ${faker.lorem.sentence()}\n\nDeadline: ${faker.date
        .future()
        .toLocaleDateString()}\n\n${faker.lorem.paragraph()}\n\nPlease don't miss this deadline. Contact us if you have any questions.`,
      `Time is running out! ${faker.lorem.paragraph()}\n\nMake sure to complete your tasks before the deadline.\n\nWe appreciate your prompt attention to this matter.`,
      `Final notice: ${faker.lorem.sentence()}\n\n${faker.lorem.paragraph()}\n\nThis is your last reminder. Please take immediate action.`,
    ],
  };

  const typeContent =
    contents[type as keyof typeof contents] || contents.general;
  return faker.helpers.arrayElement(typeContent);
};

export const seedAnnouncements = async () => {
  const societies = await prisma.society.findMany();
  const events = await prisma.event.findMany({
    where: {
      announcementEnabled: true,
    },
    include: {
      society: true,
    },
  });

  // Create event-related announcements
  for (const event of events) {
    const status = faker.helpers.arrayElement(ANNOUNCEMENT_STATUSES);
    const audience =
      event.audience === "Members"
        ? "Members"
        : faker.helpers.arrayElement(ANNOUNCEMENT_AUDIENCES);

    const publishDateTime =
      status === "Publish"
        ? faker.date.between({
            from: event.createdAt,
            to: event.startDate!,
          })
        : faker.date.between({
            from: new Date(),
            to: event.startDate!,
          });

    const title =
      generateAnnouncementTitle("event", event.society.name) + event.title;
    const content = `We are excited to announce: ${event.title}\n\n${
      event.description
    }\n\nEvent Details:\n• Date: ${event.startDate!.toLocaleDateString()}\n• Time: ${
      event.startTime
    }\n• Type: ${event.eventType}\n${
      event.eventType === "Physical"
        ? `• Venue: ${event.venueName}\n• Address: ${event.venueAddress}`
        : `• Platform: ${event.platform}\n• Meeting Link: Will be shared before the event`
    }\n\n${
      event.registrationRequired
        ? "Registration is required. Please register to secure your spot."
        : "No registration required. All are welcome!"
    }\n\n${
      event.paidEvent
        ? `Entry Fee: PKR ${event.ticketPrice}`
        : "This is a free event!"
    }\n\nDon't miss this opportunity!\n\nBest regards,\n${
      event.society.name
    } Team`;

    await prisma.announcement.create({
      data: {
        title,
        content,
        publishDateTime,
        status: status as any,
        audience: audience as any,
        sendEmail: faker.datatype.boolean({ probability: 0.3 }), // 30% chance
        societyId: event.societyId,
        eventId: event.id,
        createdAt: faker.date.between({
          from: event.createdAt,
          to: new Date(),
        }),
      },
    });
  }

  // Create general announcements for each society
  for (const society of societies) {
    const announcementCount = faker.number.int({ min: 5, max: 12 });

    for (let i = 0; i < announcementCount; i++) {
      const announcementTypes = [
        "general",
        "meeting",
        "registration",
        "achievement",
        "deadline",
      ];
      const type = faker.helpers.arrayElement(announcementTypes);

      const status = faker.helpers.arrayElement(ANNOUNCEMENT_STATUSES);
      const audience = faker.helpers.arrayElement(ANNOUNCEMENT_AUDIENCES);

      const createdAt = getRandomDate(society.createdAt, new Date());

      const publishDateTime =
        status === "Publish"
          ? faker.date.between({
              from: createdAt,
              to: new Date(),
            })
          : faker.date.between({
              from: new Date(),
              to: faker.date.future({ years: 0.5 }),
            });

      const title = generateAnnouncementTitle(type, society.name);
      const content = generateAnnouncementContent(type, society.name);

      await prisma.announcement.create({
        data: {
          title,
          content,
          publishDateTime,
          status: status as any,
          audience: audience as any,
          sendEmail: faker.datatype.boolean({ probability: 0.4 }), // 40% chance
          societyId: society.id,
          eventId: null, // General announcements not linked to events
          createdAt,
        },
      });
    }
  }
};

seedAnnouncements()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
