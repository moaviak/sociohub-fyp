import { Ticket as TicketIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Event, Ticket } from "@/types";
import { format } from "date-fns";
import { format24To12 } from "@/lib/utils";

interface EventTicketProps {
  event: Event;
  ticket: Ticket;
}

export const EventTicket = ({ event, ticket }: EventTicketProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="inline" variant={"ghost"}>
          <TicketIcon className="h-4 w-4" />
          View Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="dark text-white sm:max-w-3xl bg-primary-600 border-primary-600">
        <DialogHeader>
          <DialogTitle>Event Ticket</DialogTitle>
        </DialogHeader>

        <div className="w-full bg-white text-neutral-950 rounded-xl relative flex p-4">
          <span className="h-10 w-10 bg-primary-600 rounded-full absolute left-[50%] translate-x-[-50%] -top-5" />
          <span className="h-10 w-10 bg-primary-600 rounded-full absolute left-[50%] translate-x-[-50%] -bottom-5" />
          <span className="absolute h-full border-2 border-primary-600 border-dashed left-[50%] translate-x-[-50%]" />

          <div className="flex-1 flex flex-col h-full gap-6">
            <div className="flex gap-3 items-center">
              <img
                src={event.banner || "/assets/images/image-placeholder.png"}
                className="h-16 w-16 object-cover rounded-md"
              />
              <div>
                <p className="b2-medium">{event.title}</p>
                {event.tagline && <p className="b4-regular">{event.tagline}</p>}
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-3">
              <div>
                <p className="b4-regular">Venue</p>
                <p className="b3-medium">{event.venueName}</p>
              </div>
              <div>
                <p className="b4-regular">Date & Time</p>
                {event.startDate && event.startTime && (
                  <p className="b3-medium">
                    {`${format(
                      new Date(event.startDate),
                      "EEEE, MMMM do yyyy"
                    )} | ${format24To12(event.startDate)}`}
                  </p>
                )}
              </div>
              <div>
                <p className="b4-regular">Name</p>
                <p className="b3-medium">{`${event.registration?.student?.firstName}  ${event.registration?.student?.lastName}`}</p>
              </div>
              <div>
                <p className="b4-regular">Registration #</p>
                <p className="b3-medium">{`${event.registration?.student?.registrationNumber}`}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center">
            <p className="b2-medium">Scan this QR code</p>
            <img src={ticket.qrCode} alt="Qr-Code" className="h-52" />
            {ticket.issuedAt && (
              <p className="b3-regular text-neutral-600">
                Issued: {format(new Date(ticket.issuedAt), "MMMM do yyyy")}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
