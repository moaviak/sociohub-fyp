-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Privilege" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Privilege_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSocietyRole" (
    "studentId" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "StudentSocietyRole_pkey" PRIMARY KEY ("studentId","societyId","roleId")
);

-- CreateTable
CREATE TABLE "_RolePrivileges" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RolePrivileges_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_societyId_name_key" ON "Role"("societyId", "name");

-- CreateIndex
CREATE INDEX "_RolePrivileges_B_index" ON "_RolePrivileges"("B");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSocietyRole" ADD CONSTRAINT "StudentSocietyRole_studentId_societyId_fkey" FOREIGN KEY ("studentId", "societyId") REFERENCES "StudentSociety"("studentId", "societyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSocietyRole" ADD CONSTRAINT "StudentSocietyRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolePrivileges" ADD CONSTRAINT "_RolePrivileges_A_fkey" FOREIGN KEY ("A") REFERENCES "Privilege"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolePrivileges" ADD CONSTRAINT "_RolePrivileges_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
