import { Member } from "@/types";
import { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useGetSocietyMembersQuery } from "../../members/api";
import { SearchInput } from "@/components/search-input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

export const LeadFlyoutSearch: React.FC<{
  societyId: string;
  onSelect: (member: Member) => void;
}> = ({ societyId, onSelect }) => {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  const { data, isFetching } = useGetSocietyMembersQuery(
    { societyId, search },
    { skip: !search }
  );

  const members = data && !("error" in data) ? data : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  return (
    <div className="w-full relative">
      <SearchInput
        placeholder="Search for member..."
        className="w-full rounded-md!"
        value={input}
        onChange={handleInputChange}
        isSearching={isFetching}
      />
      {search && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
          {isFetching ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Searching...
            </div>
          ) : !members || members.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => onSelect(member)}
              >
                <div className="flex gap-x-2 items-center">
                  <Avatar>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.firstName?.charAt(0)} {member.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="b3-medium">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="b4-regular">{member.registrationNumber}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
