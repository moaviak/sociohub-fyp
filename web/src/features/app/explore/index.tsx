import { CalendarCheck, User, Users } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import People from "./people";
import Events from "./events";
import Societies from "./societies";

const Explore = () => {
  return (
    <Tabs
      defaultValue="societies"
      className="mt-4 flex-1 min-h-0 overflow-hidden"
    >
      <TabsList className="grid w-full grid-cols-3">
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
      </TabsList>
      <TabsContent value="societies" className="flex-1 min-h-0 overflow-hidden">
        <Societies />
      </TabsContent>
      <TabsContent value="people" className="flex-1 min-h-0 overflow-hidden">
        <People />
      </TabsContent>
      <TabsContent value="events" className="flex-1 min-h-0 overflow-hidden">
        <Events />
      </TabsContent>
    </Tabs>
  );
};
export default Explore;
