import { faker } from "@faker-js/faker";
import { getRandomDate } from ".";
import prisma from "../../src/db";
import {
  EventAudience,
  EventCategories,
  EventStatus,
  EventType,
  EventVisibility,
} from "@prisma/client";

const EVENT_CATEGORIES = [
  "Workshop",
  "Seminar",
  "SocialGathering",
  "Competition",
  "CulturalEvent",
  "SportsEvent",
  "Meeting",
  "Other",
];

const EVENT_TYPES = ["Physical", "Online"];
const EVENT_AUDIENCES = ["Open", "Members", "Invite"];
const EVENT_VISIBILITIES = ["Publish", "Draft", "Schedule"];
const EVENT_STATUSES = ["Upcoming", "Ongoing", "Completed", "Cancelled"];

const ONLINE_PLATFORMS = [
  "Zoom",
  "Google Meet",
  "Microsoft Teams",
  "Discord",
  "Skype",
  "WebEx",
];

const VENUE_NAMES = [
  "Main Auditorium",
  "Conference Room A",
  "Conference Room B",
  "Library Hall",
  "Computer Lab 1",
  "Computer Lab 2",
  "Sports Complex",
  "Student Center",
  "Cafeteria Hall",
  "Outdoor Ground",
];

const VENUE_ADDRESSES = [
  "COMSATS University Islamabad, Attock Campus",
  "Block A, COMSATS University Islamabad, Attock Campus",
  "Block B, COMSATS University Islamabad, Attock Campus",
  "Block C, COMSATS University Islamabad, Attock Campus",
  "Ground Floor, Main Building, COMSATS University Islamabad, Attock Campus",
];

const generateEventTitle = (category: string, societyName: string) => {
  const titles = {
    Workshop: [
      `${societyName} Technical Workshop`,
      `Advanced ${category} Workshop`,
      `Hands-on ${category} Session`,
      `Professional Development Workshop`,
    ],
    Seminar: [
      `${societyName} Knowledge Seminar`,
      `Industry Expert Seminar`,
      `Career Guidance Seminar`,
      `Research Seminar`,
    ],
    SocialGathering: [
      `${societyName} Social Meetup`,
      `Community Gathering`,
      `Welcome Social Event`,
      `Networking Session`,
    ],
    Competition: [
      `${societyName} Championship`,
      `Inter-Society Competition`,
      `Skills Challenge`,
      `Annual Competition`,
    ],
    CulturalEvent: [
      `Cultural Festival`,
      `Traditional Day`,
      `Art & Culture Show`,
      `Heritage Celebration`,
    ],
    SportsEvent: [
      `Sports Tournament`,
      `Athletic Championship`,
      `Inter-Society Sports`,
      `Fitness Challenge`,
    ],
    Meeting: [
      `${societyName} General Meeting`,
      `Committee Meeting`,
      `Planning Session`,
      `Board Meeting`,
    ],
    Other: [
      `${societyName} Special Event`,
      `Community Service`,
      `Charity Drive`,
      `Awareness Campaign`,
    ],
  };

  const categoryTitles =
    titles[category as keyof typeof titles] || titles.Other;
  return faker.helpers.arrayElement(categoryTitles);
};

const generateTagline = (category: string) => {
  const taglines = {
    Workshop: [
      "Learn, Practice, Excel",
      "Skill Development Session",
      "Hands-on Learning Experience",
      "Professional Growth Opportunity",
    ],
    Seminar: [
      "Knowledge Sharing Session",
      "Expert Insights & Discussion",
      "Learning from Industry Leaders",
      "Educational Excellence",
    ],
    SocialGathering: [
      "Connect, Share, Grow",
      "Building Community Together",
      "Networking & Fun",
      "Social Connection Event",
    ],
    Competition: [
      "Compete, Excel, Win",
      "Showcase Your Skills",
      "Challenge Your Limits",
      "Battle of Talents",
    ],
    CulturalEvent: [
      "Celebrating Our Heritage",
      "Cultural Diversity Showcase",
      "Traditional Arts & Crafts",
      "Cultural Exchange Program",
    ],
    SportsEvent: [
      "Athletic Excellence",
      "Sports & Fitness",
      "Team Spirit & Competition",
      "Healthy Competition",
    ],
    Meeting: [
      "Important Discussions",
      "Planning & Strategy",
      "Team Coordination",
      "Decision Making Session",
    ],
    Other: [
      "Special Initiative",
      "Community Impact",
      "Making a Difference",
      "Unique Experience",
    ],
  };

  const categoryTaglines =
    taglines[category as keyof typeof taglines] || taglines.Other;
  return faker.helpers.arrayElement(categoryTaglines);
};

const generateTime = () => {
  const hour = faker.number.int({ min: 9, max: 17 });
  const minute = faker.helpers.arrayElement([0, 15, 30, 45]);
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
};

const getEndTime = (startTime: string) => {
  const [hour, minute] = startTime.split(":").map(Number);
  const durationHours = faker.number.int({ min: 1, max: 4 });
  const endHour = hour + durationHours;
  return `${endHour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
};

const determineStatus = (startDate: Date, endDate: Date) => {
  const now = new Date();

  if (startDate > now) return "Upcoming";
  if (endDate < now) return "Completed";
  if (startDate <= now && endDate >= now) return "Ongoing";

  // Small chance for cancelled events
  if (Math.random() < 0.1) return "Cancelled";

  return "Completed";
};

const determineVisibility = (status: string, isDraft: boolean) => {
  if (isDraft) return "Draft";
  if (status === "Upcoming")
    return Math.random() < 0.3 ? "Schedule" : "Publish";
  return "Publish";
};

export const seedEvents = async () => {
  const societies = await prisma.society.findMany();

  for (const society of societies) {
    const eventCount = faker.number.int({ min: 8, max: 20 });

    for (let i = 0; i < eventCount; i++) {
      const categories = faker.helpers.arrayElements(EVENT_CATEGORIES, {
        min: 1,
        max: 3,
      });
      const primaryCategory = categories[0];

      const eventType = faker.helpers.arrayElement(EVENT_TYPES);
      const audience = faker.helpers.arrayElement(EVENT_AUDIENCES);
      const isDraft = Math.random() < 0.15; // 15% chance of draft

      // Generate dates (mix of past, present, and future events)
      const baseDate = faker.date.between({
        from: society.createdAt,
        to: new Date("2025-12-31"),
      });

      const startDate = new Date(baseDate);
      const endDate = new Date(startDate);

      // Events can be 1-3 days long
      const duration = faker.number.int({ min: 0, max: 2 });
      endDate.setDate(endDate.getDate() + duration);

      const startTime = generateTime();
      const endTime = getEndTime(startTime);

      const status = determineStatus(startDate, endDate);
      const visibility = determineVisibility(status, isDraft);

      const registrationRequired = Math.random() < 0.7; // 70% events require registration
      const paidEvent = Math.random() < 0.25; // 25% events are paid

      const maxParticipants = registrationRequired
        ? faker.number.int({ min: 20, max: 200 })
        : null;

      const ticketPrice = paidEvent
        ? faker.number.int({ min: 200, max: 2000 })
        : null;

      const registrationDeadline =
        registrationRequired && startDate > new Date()
          ? faker.date.between({ from: new Date(), to: startDate })
          : null;

      const publishDateTime =
        visibility === "Publish"
          ? faker.date.between({
              from: getRandomDate(society.createdAt, startDate),
              to: startDate,
            })
          : null;

      const eventData = {
        title: generateEventTitle(primaryCategory, society.name),
        tagline: generateTagline(primaryCategory),
        description: faker.lorem.paragraphs(
          faker.number.int({ min: 2, max: 4 })
        ),
        categories: categories as EventCategories[],
        banner: `https://picsum.photos/800/400?random=${faker.number.int({
          min: 1,
          max: 1000,
        })}`,
        startDate,
        endDate,
        startTime,
        endTime,
        eventType: eventType as EventType,
        venueName:
          eventType === "Physical"
            ? faker.helpers.arrayElement(VENUE_NAMES)
            : null,
        venueAddress:
          eventType === "Physical"
            ? faker.helpers.arrayElement(VENUE_ADDRESSES)
            : null,
        platform:
          eventType === "Online"
            ? faker.helpers.arrayElement(ONLINE_PLATFORMS)
            : null,
        meetingLink: eventType === "Online" ? faker.internet.url() : null,
        accessInstructions:
          eventType === "Online"
            ? "Meeting link will be shared 30 minutes before the event"
            : "Please bring your university ID card for entry",
        audience: audience as EventAudience,
        visibility: visibility as EventVisibility,
        publishDateTime,
        registrationRequired,
        registrationDeadline,
        maxParticipants,
        paidEvent,
        ticketPrice,
        status: status as EventStatus,
        isDraft,
        formStep: isDraft ? faker.number.int({ min: 1, max: 6 }) : null,
        createdAt: getRandomDate(society.createdAt, new Date()),
      };

      await prisma.event.create({
        data: { ...eventData, society: { connect: { id: society.id } } },
      });
    }
  }
};

seedEvents()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
