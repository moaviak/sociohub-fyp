import { Society } from "@/types";
import { Goal, HandHeart, Mail, NotebookText, Telescope } from "lucide-react";

interface SocietyInfoProps {
  society: Society;
}

export const SocietyInfo = ({ society }: SocietyInfoProps) => {
  return (
    <div className="flex flex-col p-4 gap-4">
      <div className="grid grid-cols-10 gap-4 rounded-md w-full p-4">
        <div className="col-span-2 flex gap-2">
          <Telescope className="w-6 h-6 text-secondary-600" />
          <p className="b1-semibold">Vision</p>
        </div>
        <p className="b2-regular col-span-8">{society.description || "N/A"}</p>
      </div>
      <div className="grid grid-cols-10 gap-4 items-center rounded-md w-full p-4">
        <div className="col-span-2 flex gap-2">
          <NotebookText className="w-6 h-6 text-accent-500" />
          <p className="b1-semibold">Statement of Purpose</p>
        </div>
        <p className="b2-regular col-span-8">
          {society.statementOfPurpose || "N/A"}
        </p>
      </div>
      <div className="grid grid-cols-10 gap-4 items-center rounded-md w-full p-4">
        <div className="col-span-2 flex gap-2">
          <Mail className="w-6 h-6 text-amber-500" />
          <p className="b1-semibold">Faculty Advisor Message</p>
        </div>
        <p className="b2-regular col-span-8">
          {society.advisorMessage || "N/A"}
        </p>
      </div>
      <div className="grid grid-cols-10 gap-4 items-center rounded-md w-full p-4">
        <div className="col-span-2 flex gap-2">
          <Goal className="w-6 h-6 text-emerald-500" />
          <p className="b1-semibold">Mission</p>
        </div>
        <p className="b2-regular col-span-8">{society.mission || "N/A"}</p>
      </div>
      <div className="grid grid-cols-10 gap-4 items-center rounded-md w-full p-4">
        <div className="col-span-2 flex gap-2">
          <HandHeart className="w-6 h-6 text-primary-500" />
          <p className="b1-semibold">Core Values</p>
        </div>
        <p className="b2-regular col-span-8">{society.coreValues || "N/A"}</p>
      </div>
    </div>
  );
};
