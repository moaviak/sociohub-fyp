import { faker } from "@faker-js/faker";
import prisma from "../../src/db";
import { getRandomDate } from ".";
import { PostType } from "@prisma/client";

const MEDIA_TYPES = ["IMAGE"];

export const seedPosts = async () => {
  const societies = await prisma.society.findMany();
  const users = await prisma.user.findMany({
    where: { studentId: { not: null } },
    include: { student: true },
  });
  const events = await prisma.event.findMany();

  for (const society of societies) {
    // Get all users whose student is a member of this society
    const memberships = await prisma.studentSociety.findMany({
      where: { societyId: society.id },
      select: { studentId: true },
    });
    const memberStudentIds = memberships.map((m) => m.studentId);
    const societyUsers = users.filter(
      (u) => u.student && memberStudentIds.includes(u.student.id)
    );
    if (societyUsers.length === 0) continue;

    // Each society gets 10-20 posts
    const postCount = faker.number.int({ min: 10, max: 20 });
    for (let i = 0; i < postCount; i++) {
      const user = faker.helpers.arrayElement(societyUsers);
      // Pick type
      const type = faker.helpers.arrayElement([
        PostType.NORMAL,
        PostType.EVENT_GALLERY,
      ]);
      let eventId: string | null = null;
      if (type === PostType.EVENT_GALLERY && events.length) {
        // Pick a random event from this society
        const societyEvents = events.filter((e) => e.societyId === society.id);
        if (societyEvents.length) {
          eventId = faker.helpers.arrayElement(societyEvents).id;
        }
      }
      const createdAt = getRandomDate(society.createdAt, new Date());
      const post = await prisma.post.create({
        data: {
          content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
          type,
          authorId: user.id,
          societyId: society.id,
          eventId,
          createdAt,
        },
      });

      // Add media (0-5 per post)
      const mediaCount = faker.number.int({ min: 0, max: 5 });
      for (let m = 0; m < mediaCount; m++) {
        await prisma.postMedia.create({
          data: {
            url: faker.image.urlPicsumPhotos({
              width: 1080,
              height: 1080,
              blur: 0,
            }),
            type: faker.helpers.arrayElement(MEDIA_TYPES),
            postId: post.id,
          },
        });
      }

      // Add likes (0-20 per post)
      const likeCount = faker.number.int({ min: 0, max: 20 });
      const likeUsers = faker.helpers.arrayElements(users, {
        min: 0,
        max: likeCount,
      });
      for (const likeUser of likeUsers) {
        await prisma.postLike.create({
          data: {
            postId: post.id,
            userId: likeUser.id,
          },
        });
      }

      // Add comments (0-10 per post)
      const commentCount = faker.number.int({ min: 0, max: 10 });
      for (let c = 0; c < commentCount; c++) {
        const commentUser = faker.helpers.arrayElement(users);
        const comment = await prisma.postComment.create({
          data: {
            content: faker.lorem.sentences(
              faker.number.int({ min: 1, max: 3 })
            ),
            postId: post.id,
            authorId: commentUser.id,
            createdAt: getRandomDate(createdAt, new Date()),
          },
        });
        // Add replies (0-2 per comment)
        const replyCount = faker.number.int({ min: 0, max: 2 });
        for (let r = 0; r < replyCount; r++) {
          const replyUser = faker.helpers.arrayElement(users);
          await prisma.postComment.create({
            data: {
              content: faker.lorem.sentences(
                faker.number.int({ min: 1, max: 2 })
              ),
              postId: post.id,
              authorId: replyUser.id,
              parentId: comment.id,
              createdAt: getRandomDate(comment.createdAt, new Date()),
            },
          });
        }
      }
    }
  }
};

seedPosts()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
