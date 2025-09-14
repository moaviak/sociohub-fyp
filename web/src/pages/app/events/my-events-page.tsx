import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { MyEvents } from "@/features/app/events/my-events";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck2, CalendarClock } from "lucide-react";

const MyEventsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const validTabs = useMemo(() => ["registered", "invited"], []);
  const hashTab = location.hash.replace(/^#/, "");
  const initialTab = validTabs.includes(hashTab) ? hashTab : "registered";

  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab with hash changes
  useEffect(() => {
    const hashTab = location.hash.replace(/^#/, "");
    if (validTabs.includes(hashTab)) {
      setActiveTab(hashTab);
    } else {
      setActiveTab("registered");
    }
  }, [location.hash, validTabs]);

  // When tab changes, update hash
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate({ hash: `#${value}` }, { replace: true });
  };

  return (
    <div className="flex flex-col px-4 py-2">
      <div>
        <h3 className="h3-semibold">My Events</h3>
        <p className="b3-regular">
          View and manage the events you've invited and registered for.
        </p>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="mt-4 flex-1 min-h-0 w-full overflow-hidden"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger className="b2-semibold gap-x-3" value="registered">
            <CalendarCheck2 className="w-6 h-6 text-primary-600" />
            Registered
          </TabsTrigger>
          <TabsTrigger className="b2-semibold gap-x-3" value="invited">
            <CalendarClock className="w-6 h-6 text-primary-600" />
            Invited
          </TabsTrigger>
        </TabsList>
        <TabsContent value="registered" className="flex-1">
          <MyEvents />
        </TabsContent>
        <TabsContent value="invited" className="flex-1">
          <MyEvents />
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default MyEventsPage;
