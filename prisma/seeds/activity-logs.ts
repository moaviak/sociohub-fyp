import { faker } from "@faker-js/faker";
import prisma from "../../src/db";
import { ActionNature } from "@prisma/client";

// Define possible actions and natures
const ACTIONS = [
  "CREATED_EVENT",
  "UPDATED_EVENT",
  "DELETED_EVENT",
  "REGISTERED_EVENT",
  "REMOVED_MEMBER",
  "ADDED_MEMBER",
  "UPDATED_PROFILE",
  "POSTED_ANNOUNCEMENT",
  "JOINED_SOCIETY",
  "LEFT_SOCIETY",
  "CREATED_TASK",
  "COMPLETED_TASK",
  "VIEWED_ANNOUNCEMENT",
  "COMMENTED_POST",
  "LIKED_POST",
  "UPLOADED_FILE",
  "DOWNLOADED_FILE",
  "SENT_MESSAGE",
  "RECEIVED_MESSAGE",
  "CHANGED_ROLE",
  "BLOCKED_MEMBER",
  "UNBLOCKED_MEMBER",
];

const NATURES = [
  ActionNature.CONSTRUCTIVE,
  ActionNature.NEUTRAL,
  ActionNature.DESTRUCTIVE,
  ActionNature.ADMINISTRATIVE,
];

const TARGET_TYPES = [
  "Event",
  "Member",
  "Announcement",
  "Task",
  "Post",
  "Society",
  "Profile",
  "File",
  "Message",
  "Role",
];

const getRandomNature = (action: string): ActionNature => {
  if (
    action.startsWith("CREATED") ||
    action.startsWith("ADDED") ||
    action === "POSTED_ANNOUNCEMENT" ||
    action === "COMMENTED_POST" ||
    action === "LIKED_POST" ||
    action === "UPLOADED_FILE" ||
    action === "SENT_MESSAGE" ||
    action === "JOINED_SOCIETY" ||
    action === "COMPLETED_TASK"
  ) {
    return ActionNature.CONSTRUCTIVE;
  }
  if (
    action.startsWith("UPDATED") ||
    action === "VIEWED_ANNOUNCEMENT" ||
    action === "DOWNLOADED_FILE" ||
    action === "RECEIVED_MESSAGE" ||
    action === "CHANGED_ROLE" ||
    action === "LEFT_SOCIETY"
  ) {
    return ActionNature.NEUTRAL;
  }
  if (
    action.startsWith("DELETED") ||
    action === "REMOVED_MEMBER" ||
    action === "BLOCKED_MEMBER" ||
    action === "UNBLOCKED_MEMBER"
  ) {
    return ActionNature.DESTRUCTIVE;
  }
  if (action === "CHANGED_ROLE") {
    return ActionNature.ADMINISTRATIVE;
  }
  return faker.helpers.arrayElement(NATURES);
};

const getDescription = (action: string, targetType: string) => {
  // Simple human-readable descriptions
  switch (action) {
    case "CREATED_EVENT":
      return "Created a new event";
    case "UPDATED_EVENT":
      return "Updated event details";
    case "DELETED_EVENT":
      return "Deleted an event";
    case "REGISTERED_EVENT":
      return "Registered for an event";
    case "REMOVED_MEMBER":
      return "Removed a member from the society";
    case "ADDED_MEMBER":
      return "Added a new member to the society";
    case "UPDATED_PROFILE":
      return "Updated profile information";
    case "POSTED_ANNOUNCEMENT":
      return "Posted a new announcement";
    case "JOINED_SOCIETY":
      return "Joined the society";
    case "LEFT_SOCIETY":
      return "Left the society";
    case "CREATED_TASK":
      return "Created a new task";
    case "COMPLETED_TASK":
      return "Completed a task";
    case "VIEWED_ANNOUNCEMENT":
      return "Viewed an announcement";
    case "COMMENTED_POST":
      return "Commented on a post";
    case "LIKED_POST":
      return "Liked a post";
    case "UPLOADED_FILE":
      return "Uploaded a file";
    case "DOWNLOADED_FILE":
      return "Downloaded a file";
    case "SENT_MESSAGE":
      return "Sent a message";
    case "RECEIVED_MESSAGE":
      return "Received a message";
    case "CHANGED_ROLE":
      return "Changed a member's role";
    case "BLOCKED_MEMBER":
      return "Blocked a member";
    case "UNBLOCKED_MEMBER":
      return "Unblocked a member";
    default:
      return `Performed action: ${action}`;
  }
};

export const seedActivityLogs = async () => {
  const students = await prisma.student.findMany();
  const societies = await prisma.society.findMany();

  // For each student, create logs for societies they are a member of
  const memberships = await prisma.studentSociety.findMany({
    select: { studentId: true, societyId: true },
  });

  const logsToCreate = [];

  for (const membership of memberships) {
    // Each student in a society gets 10-30 logs
    const logCount = faker.number.int({ min: 10, max: 30 });
    for (let i = 0; i < logCount; i++) {
      const action = faker.helpers.arrayElement(ACTIONS);
      const nature = getRandomNature(action);
      const targetType = faker.helpers.arrayElement(TARGET_TYPES);

      logsToCreate.push({
        studentId: membership.studentId,
        societyId: membership.societyId,
        action,
        description: getDescription(action, targetType),
        nature,
        targetId: faker.string.uuid(),
        targetType,
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        timestamp: faker.date.between({
          from: new Date("2023-06-01"),
          to: new Date(),
        }),
      });
    }
  }

  // Batch insert for performance
  for (let i = 0; i < logsToCreate.length; i += 1000) {
    await prisma.activityLog.createMany({
      data: logsToCreate.slice(i, i + 1000),
      skipDuplicates: true,
    });
  }
};

seedActivityLogs()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
