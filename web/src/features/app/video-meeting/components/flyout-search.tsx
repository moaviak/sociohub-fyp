import useGetSocietyId from "@/hooks/useGetSocietyId";
import { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useGetSocietyPeopleQuery } from "../api";
import { SearchInput } from "@/components/search-input";
import { Advisor, Member, UserType } from "@/types";
import { AvatarGroup } from "@/components/avatar-group";
import { RolesBadges } from "../../members/components/roles-badges";
import { Checkbox } from "@/components/ui/checkbox";
import type { CheckedUser } from "../meeting-form";

export const FlyoutSearch = ({
  checkedUsers,
  setCheckedUsers,
}: {
  checkedUsers: CheckedUser[];
  setCheckedUsers: React.Dispatch<React.SetStateAction<CheckedUser[]>>;
}) => {
  const societyId = useGetSocietyId();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  const { data, isFetching } = useGetSocietyPeopleQuery(
    {
      societyId: societyId || "",
      search,
    },
    { skip: !search }
  );

  const people = data && !("error" in data) ? data : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  const isUserChecked = (user: Advisor | Member) => {
    return checkedUsers.some((u) => u.id === user.id);
  };

  const handleCheckboxChange = (user: Advisor | Member) => {
    setCheckedUsers((prev) => {
      if (prev.some((u) => u.id === user.id)) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        const { id, avatar } = user;
        const firstName = user.firstName ?? "";
        const lastName = user.lastName ?? "";
        return [...prev, { id, firstName, lastName, avatar }];
      }
    });
  };

  return (
    <div className="w-full relative">
      <SearchInput
        placeholder="Search member"
        className="w-full"
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
          ) : !people ||
            (!people.advisor &&
              (!people.members || people.members.length === 0)) ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found
            </div>
          ) : (
            <>
              {people.advisor && (
                <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <FlyoutSearchResult
                    user={people.advisor}
                    checked={
                      people.advisor ? isUserChecked(people.advisor) : false
                    }
                    onCheckedChange={() =>
                      people.advisor && handleCheckboxChange(people.advisor)
                    }
                  />
                </div>
              )}
              {people.members.map((user: Member, idx: number) => (
                <div
                  key={user.id || idx}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <FlyoutSearchResult
                    user={user}
                    checked={isUserChecked(user)}
                    onCheckedChange={() => handleCheckboxChange(user)}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const FlyoutSearchResult = ({
  user,
  checked,
  onCheckedChange,
}: {
  user: Advisor | Member;
  checked: boolean;
  onCheckedChange: () => void;
}) => {
  return (
    <div className="w-full flex items-center gap-x-3">
      <Checkbox
        className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <AvatarGroup
        user={user}
        userType={
          "registrationNumber" in user ? UserType.STUDENT : UserType.ADVISOR
        }
      />
      {"registrationNumber" in user && <RolesBadges roles={user.roles || []} />}
    </div>
  );
};
