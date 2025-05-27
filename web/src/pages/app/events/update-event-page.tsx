import { UpdateEvent } from "@/features/app/events/update-event";

const UpdateEventPage = () => {
  return (
    <div className="flex flex-col px-4 py-2 gap-y-4 h-full">
      <UpdateEvent />
    </div>
  );
};
export default UpdateEventPage;
