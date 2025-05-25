import { EventForm } from "./components/event-form";

export const CreateEvent = () => {
  return (
    <div className="flex flex-col gap-y-6 h-full">
      <div>
        <h4 className="h4-semibold">Create New Event</h4>
        <p className="b3-regular">
          Fill in the details to organize your society's next activity.
        </p>
      </div>
      <EventForm />
    </div>
  );
};
