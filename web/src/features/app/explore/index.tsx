import { CalendarCheck, Megaphone, User, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState, useMemo } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import People from "./people";
import Events from "./events";
import Societies from "./societies";
import { StudentAnnouncements } from "../announcements/student-announcements";

const Explore = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const validTabs = useMemo(
    () => ["societies", "people", "events", "announcements"],
    []
  );
  const hashTab = location.hash.replace(/^#/, "");
  const initialTab = validTabs.includes(hashTab) ? hashTab : "societies";

  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab with hash changes
  useEffect(() => {
    const hashTab = location.hash.replace(/^#/, "");
    if (validTabs.includes(hashTab)) {
      setActiveTab(hashTab);
    } else {
      setActiveTab("societies");
    }
  }, [location.hash, validTabs]);

  // When tab changes, update hash
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate({ hash: `#${value}` }, { replace: true });
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="mt-4 flex-1 min-h-0 overflow-hidden"
    >
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger className="b2-semibold gap-x-3" value="societies">
          <Users className="w-6 h-6 text-primary-600" />
          Societies
        </TabsTrigger>
        <TabsTrigger className="b2-semibold gap-x-3" value="people">
          <User className="w-6 h-6 text-primary-600" />
          People
        </TabsTrigger>
        <TabsTrigger className="b2-semibold gap-x-3" value="events">
          <CalendarCheck className="w-6 h-6 text-primary-600" />
          Events
        </TabsTrigger>
        <TabsTrigger className="b2-semibold gap-x-3" value="announcements">
          <Megaphone className="w-6 h-6 text-primary-600" />
          Announcements
        </TabsTrigger>
      </TabsList>
      <TabsContent value="societies" className="flex-1">
        <Societies />
      </TabsContent>
      <TabsContent value="people" className="flex-1">
        <People />
      </TabsContent>
      <TabsContent value="events" className="flex-1">
        <Events />
      </TabsContent>
      <TabsContent value="announcements" className="flex-1">
        <StudentAnnouncements />
      </TabsContent>
    </Tabs>
  );
};
export default Explore;
