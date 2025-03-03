import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

import { DEGREES } from "@/data";
import { getYearOptions } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ApiError from "@/features/api-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSetRegistrationNumberMutation } from "@/features/auth/api";

const RegNo = () => {
  const [setRegistrationNumber, { isLoading, isError, error }] =
    useSetRegistrationNumberMutation();
  const navigate = useNavigate();

  const yearOptions = getYearOptions();

  const [regNo, setRegNo] = useState<{
    session: string;
    year: string;
    degree: string;
    rollNumber: number | undefined;
  }>({
    session: "SP",
    year: yearOptions[yearOptions.length - 1],
    degree: DEGREES[0].value,
    rollNumber: undefined,
  });

  const handleContinue = async () => {
    const formattedRegistrationNumber = `${regNo.session}${regNo.year}-${regNo.degree}-${regNo.rollNumber}`;

    const response = await setRegistrationNumber({
      registrationNumber: formattedRegistrationNumber,
    });

    if (!("error" in response) && response.data) {
      toast.success("Registration number set successfully.");
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as ApiError)?.errorMessage || "An unexpected error occurred",
        {
          duration: 10000,
        }
      );
    }
  }, [isError, error]);

  return (
    <div className="flex flex-col gap-y-4">
      <Label>Registration No.</Label>
      <div className="grid grid-cols-4 gap-2">
        <Select
          onValueChange={(value) => setRegNo({ ...regNo, session: value })}
          defaultValue={regNo.session}
        >
          <SelectTrigger className="outline-1 outline-neutral-300">
            <SelectValue defaultValue={regNo.session} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SP">SP</SelectItem>
            <SelectItem value="FA">FA</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => setRegNo({ ...regNo, year: value })}
          defaultValue={regNo.year}
        >
          <SelectTrigger className="outline-1 outline-neutral-300">
            <SelectValue defaultValue={regNo.year} />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => setRegNo({ ...regNo, degree: value })}
          defaultValue={regNo.degree}
        >
          <SelectTrigger className="outline-1 outline-neutral-300">
            <SelectValue defaultValue={regNo.degree} />
          </SelectTrigger>
          <SelectContent>
            {DEGREES.map((degree) => (
              <SelectItem key={degree.value} value={degree.value}>
                {degree.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          value={regNo.rollNumber ?? ""}
          onChange={(e) =>
            setRegNo({ ...regNo, rollNumber: Number(e.target.value) })
          }
          className="outline-1 outline-neutral-300"
        />
      </div>
      <Button
        size="lg"
        className="self-end"
        onClick={handleContinue}
        disabled={isLoading}
      >
        Continue
      </Button>
    </div>
  );
};
export default RegNo;
