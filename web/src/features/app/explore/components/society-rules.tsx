import { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SocietyRulesProps {
  form: UseFormReturn<
    {
      societyId: string;
      whatsappNo: string;
      semester: number;
      interestedRole: string;
      reason: string;
      expectations: string;
      skills: string;
      isAgree: boolean;
    },
    undefined
  >;
}

export const SocietyRules = ({ form }: SocietyRulesProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "outline p-4 max-h-64 overflow-y-auto bg-neutral-50 outline-neutral-400 rounded-md text-sm space-y-3",
          open ? "block" : "hidden"
        )}
      >
        <div>
          <strong>1. Respect and Professional Conduct</strong>
          <p>
            Members shall treat all fellow students, advisors, and university
            staff with respect and courtesy at all times. Discrimination,
            harassment, or any form of misconduct will not be tolerated.
          </p>
        </div>

        <div>
          <strong>2. Active Participation</strong>
          <p>
            Members are expected to participate actively in society meetings,
            events, and activities. Repeated absence or non-involvement may
            result in revocation of membership.
          </p>
        </div>

        <div>
          <strong>3. Compliance with Society Structure</strong>
          <p>
            Members must respect the society’s internal structure, including the
            authority of advisors, heads, and designated roles. Instructions
            given by society officials must be followed in good faith.
          </p>
        </div>

        <div>
          <strong>4. Adherence to University Policies</strong>
          <p>
            All society activities must comply with the rules and code of
            conduct set forth by the university administration. Unauthorized use
            of university property or name for personal or society purposes is
            strictly prohibited.
          </p>
        </div>

        <div>
          <strong>5. Responsible Representation</strong>
          <p>
            Members represent the society and the university during internal and
            external events. Any behavior that tarnishes the reputation of
            either is subject to disciplinary action.
          </p>
        </div>

        <div>
          <strong>6. Financial Transparency and Integrity</strong>
          <p>
            Members involved in event organization or handling finances must
            operate transparently and maintain proper records. Misuse of funds
            or resources will result in immediate removal and possible
            university action.
          </p>
        </div>

        <div>
          <strong>7. Confidentiality and Data Protection</strong>
          <p>
            Internal matters and data shared within the society (e.g., event
            plans, communications) should not be disclosed without
            authorization.
          </p>
        </div>

        <div>
          <strong>8. Zero Tolerance for Misconduct</strong>
          <p>
            Any act of dishonesty, violence, plagiarism, or disruptive behavior
            will lead to strict disciplinary measures including removal from the
            society.
          </p>
        </div>

        <div>
          <strong>9. Resignation and Termination</strong>
          <p>
            Members may resign from the society by submitting a formal request.
            The society reserves the right to terminate membership on grounds of
            non-compliance or misconduct, subject to advisor approval.
          </p>
        </div>

        <div>
          <strong>10. Acceptance of Amendments</strong>
          <p>
            Members agree to comply with future amendments to society rules as
            approved by the society’s advisor and management committee.
          </p>
        </div>
      </div>
      <FormField
        control={form.control}
        name="isAgree"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-2 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="b4-regular">
                I agree to abide by the{" "}
                <span
                  className="text-primary-600 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(!open);
                  }}
                >
                  society's rules
                </span>{" "}
                and actively participate in its activities.
              </FormLabel>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};
