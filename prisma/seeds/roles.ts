import prisma from "../../src/db";

export const seedRoles = async () => {
  const societies = await prisma.society.findMany();
  const privileges = await prisma.privilege.findMany();
  const roles = [
    {
      name: "Member",
      description:
        "A member of the society who participates in activities and events.",
      privileges: [],
    },
    {
      name: "President",
      description:
        "The President serves as the official representative of the Society and acts as the primary link between the Society and university administration. They are responsible for overseeing all functional offices, initiating society projects, and co-approving budgets alongside the Vice President, General Secretary, and Treasurer. The President holds the deciding vote in society matters unless a dissent is raised by the Vice President, General Secretary, or Patron. They are required to sign all official documents on behalf of the Society and ensure they are approved by the Patron. Furthermore, the President must adhere to all university policies and procedures and is responsible for ensuring that all members do the same.",
      privileges: [
        "event_management",
        "member_management",
        "announcement_management",
        "content_management",
        "event_ticket_handling",
        "society_settings_management",
        "task_management",
        "meeting_management",
      ],
    },
    {
      name: "Vice President",
      description:
        "The Vice President assists the President in all responsibilities, including overseeing society operations, supporting project execution, and representing the Society when needed. They play a crucial supporting role in leadership, decision-making, and ensuring the smooth execution of society activities.",
      privileges: [
        "event_management",
        "member_management",
        "announcement_management",
        "content_management",
        "event_ticket_handling",
        "task_management",
        "meeting_management",
      ],
    },
    {
      name: "General Secretary",
      description:
        "The General Secretary is responsible for facilitating the operations of all functional offices within the Society. They work closely with the President in corresponding with the university administration, ensuring smooth project execution, and maintaining momentum for all initiatives. Additionally, the General Secretary prepares and manages operational checklists for events and monitors ongoing tasks to ensure timely completion.",
      privileges: [
        "event_management",
        "announcement_management",
        "content_management",
        "event_ticket_handling",
        "task_management",
        "meeting_management",
      ],
    },
    {
      name: "Treasurer",
      description:
        "The Treasurer manages all financial matters of the Society, including maintaining accurate records of income, expenses, and donations. They are responsible for drafting budgets for proposed events, securing necessary approvals from the Patron and Accounts Office, and coordinating with the Accounts Office for the release of petty cash. The Treasurer ensures all receipts and financial documentation are properly recorded and organized, maintaining transparency and accountability in the Society's financial operations.",
      privileges: ["payment_finance_management"],
    },
  ];

  for (const society of societies) {
    for (const role of roles) {
      const createdRole = await prisma.role.upsert({
        where: { societyId_name: { societyId: society.id, name: role.name } },
        update: {},
        create: {
          name: role.name,
          description: role.description,
          society: { connect: { id: society.id } },
        },
      });

      for (const privilegeKey of role.privileges) {
        const privilege = privileges.find((p) => p.key === privilegeKey);
        if (privilege) {
          await prisma.role.update({
            where: { id: createdRole.id },
            data: {
              privileges: { connect: { id: privilege.id } },
            },
          });
        }
      }
    }
  }
};
