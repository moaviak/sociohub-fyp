import { UseFormReturn } from "react-hook-form";
import { EventFormData } from "../../schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import DOMPurify from "dompurify";

interface ReviewSectionProps {
  form: UseFormReturn<EventFormData>;
}

type ReviewItem = { label: string; value: React.ReactNode };

function isReviewItem(item: unknown): item is ReviewItem {
  return (
    !!item && typeof item === "object" && "label" in item && "value" in item
  );
}

export const ReviewSection = ({ form }: ReviewSectionProps) => {
  const values = form.getValues();

  // Helper formatters
  const formatDate = (date?: Date) => (date ? format(date, "PPP") : "-");
  const formatDateTime = (date?: Date) => (date ? format(date, "PPP p") : "-");
  const formatTime = (time?: string) => time || "-";
  const boolText = (val?: boolean) => (val ? "Yes" : "No");

  // Section: Basic Info
  const basicInfo: unknown[] = [
    { label: "Event Title", value: values.eventTitle },
    { label: "Event Tagline", value: values.eventTagline || "-" },
    {
      label: "Detailed Description",
      value: (
        <div
          className="prose max-w-none bg-muted rounded-md p-3 border min-h-24 max-h-60 overflow-y-auto custom-scrollbar whitespace-pre-line text-sm"
          // Use DOMPurify to sanitize HTML before rendering
          dangerouslySetInnerHTML={{
            __html: values.detailedDescription
              ? DOMPurify.sanitize(values.detailedDescription)
              : "-",
          }}
        />
      ),
    },
    {
      label: "Event Categories",
      value: values.eventCategories?.length ? (
        <div className="flex flex-wrap gap-2">
          {values.eventCategories.map((cat: string) => (
            <Badge
              key={cat}
              variant={"outline"}
              className="border-neutral-400 text-neutral-600 bg-neutral-100"
            >
              {cat}
            </Badge>
          ))}
        </div>
      ) : (
        "-"
      ),
    },
    // Event image is not shown as preview here
  ];

  // Section: Date & Time
  const dateTime: unknown[] = [
    { label: "Start Date", value: formatDate(values.startDate) },
    { label: "Start Time", value: formatTime(values.startTime) },
    { label: "End Date", value: formatDate(values.endDate) },
    { label: "End Time", value: formatTime(values.endTime) },
  ];

  // Section: Location
  const isPhysical = values.eventType === "Physical";
  const isOnline = values.eventType === "Online";
  const location: unknown[] = [
    { label: "Event Type", value: values.eventType },
    isPhysical && { label: "Venue Name", value: values.venueName || "-" },
    isPhysical && { label: "Address", value: values.address || "-" },
    isOnline && { label: "Platform", value: values.platform || "-" },
    isOnline &&
      values.platform === "Other" && {
        label: "Other Platform",
        value: values.otherPlatform || "-",
      },
    isOnline && {
      label: "Meeting Link",
      value: values.meetingLink || "-",
    },
    isOnline && {
      label: "Access Instructions",
      value: values.accessInstructions || "-",
    },
  ];

  // Section: Audience & Visibility
  const audience: unknown[] = [
    { label: "Audience", value: values.audience },
    { label: "Visibility", value: values.visibility },
    values.visibility === "Schedule" && {
      label: "Publish Date & Time",
      value: formatDateTime(values.publishDateTime),
    },
  ];

  // Section: Registration & Tickets
  const registration: unknown[] = [
    {
      label: "Registration Required",
      value: boolText(values.isRegistrationRequired),
    },
    values.isRegistrationRequired && {
      label: "Registration Deadline",
      value: formatDateTime(values.registrationDeadline),
    },
    values.isRegistrationRequired && {
      label: "Maximum Participants",
      value: values.maximumParticipants || "Unlimited",
    },
    values.isRegistrationRequired && {
      label: "Paid Event",
      value: boolText(values.isPaidEvent),
    },
    values.isRegistrationRequired &&
      values.isPaidEvent && {
        label: "Ticket Price",
        value: values.ticketPrice ? `PKR ${values.ticketPrice}` : "-",
      },
  ];

  // Section: Announcement
  const announcement: unknown[] = [
    {
      label: "Announcement Enabled",
      value: boolText(values.isAnnouncementEnabled),
    },
    values.isAnnouncementEnabled && {
      label: "Announcement Text",
      value: (
        <div className="bg-muted rounded-md p-3 border min-h-16 max-h-30 overflow-y-auto custom-scrollbar whitespace-pre-line text-sm">
          {values.announcement || "-"}
        </div>
      ),
    },
  ];

  // Helper to render a section
  const renderSection = (title: string, items: ReviewItem[]) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row md:items-center md:gap-4"
            >
              <span className="font-medium min-w-[180px] text-muted-foreground">
                {item.label}
              </span>
              <span className="break-words flex-1">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {renderSection("Basic Event Information", basicInfo.filter(isReviewItem))}
      {renderSection("Date & Time", dateTime.filter(isReviewItem))}
      {renderSection("Location", location.filter(isReviewItem))}
      {renderSection("Audience & Visibility", audience.filter(isReviewItem))}
      {renderSection(
        "Registration & Tickets",
        registration.filter(isReviewItem)
      )}
      {renderSection("Announcement", announcement.filter(isReviewItem))}
    </div>
  );
};
