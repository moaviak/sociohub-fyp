import { MyEvents } from "@/features/app/events/my-events";

const MyEventsPage = () => {
  return (
    <div className="flex flex-col px-4 py-2">
      <div>
        <h3 className="h3-semibold">My Events</h3>
        <p className="b3-regular">
          View and manage the events you've registered for.
        </p>
      </div>
      <div className="flex-1 flex">
        <MyEvents />
      </div>
    </div>
  );
};
export default MyEventsPage;
