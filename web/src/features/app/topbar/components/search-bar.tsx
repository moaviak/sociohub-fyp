import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export const SearchBar = () => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
      <Input
        className="w-lg outline outline-neutral-400 rounded-xl pl-10"
        placeholder="Search people, events, and societies"
      />
    </div>
  );
};
