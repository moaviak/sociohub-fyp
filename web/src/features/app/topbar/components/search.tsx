import { SearchInput } from "@/components/search-input";
import { AvatarGroup } from "@/components/avatar-group";
import { formatEventDateTime } from "@/lib/utils";
import { Advisor, Event, Society, Student, UserType } from "@/types";
import { useState, useRef, useEffect } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { User, Calendar, Users, Search as SearchIcon } from "lucide-react";
import {
  useFetchUsersQuery,
  useGetEventsInfiniteQuery,
  useGetSocietiesQuery,
} from "../../explore/api";
import { Link } from "react-router";

// Search Section Component
const SearchSection: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  children: React.ReactNode;
}> = ({ title, icon: Icon, count, children }) => {
  if (count === 0) return null;

  return (
    <div className="py-2">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
        <Icon className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <span className="text-xs text-gray-500">({count})</span>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
};

// People Item Component
const PersonItem: React.FC<{
  person: Student | Advisor;
  onClick: () => void;
}> = ({ person, onClick }) => {
  return (
    <Link to={`/profile/${person.id}`} onClick={onClick}>
      <div className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
        <AvatarGroup
          user={person}
          userType={
            "registrationNumber" in person ? UserType.STUDENT : UserType.ADVISOR
          }
        />
      </div>
    </Link>
  );
};

// Enhanced Society Item Component
const SocietyItem: React.FC<{ society: Society; onClick: () => void }> = ({
  society,
  onClick,
}) => {
  return (
    <Link to={`/society/${society.id}`} onClick={onClick}>
      <div className="flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer">
        <div className="flex-shrink-0">
          <img
            src={society.logo || "/assets/images/society-placeholder.png"}
            alt={society.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {society.name}
          </p>
          {society._count?.members && (
            <p className="text-xs text-gray-500">
              {society._count.members} members
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

// Enhanced Event Item Component
const EventItem: React.FC<{ event: Event; onClick: () => void }> = ({
  event,
  onClick,
}) => {
  return (
    <Link to={`/event/${event.id}`} onClick={onClick}>
      <div className="flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer">
        <div className="flex-shrink-0">
          <img
            src={event.banner || "/assets/images/placeholder.png"}
            alt={event.title}
            className="w-10 h-10 rounded object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {event.title}
          </p>
          {event.startDate &&
            event.startTime &&
            event.endDate &&
            event.endTime && (
              <p className="text-xs text-gray-500 truncate">
                {formatEventDateTime(
                  event.startDate,
                  event.endDate,
                  event.startTime,
                  event.endTime
                )}
              </p>
            )}
        </div>
      </div>
    </Link>
  );
};

export const Search = () => {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  const searchRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: people = [] } = useFetchUsersQuery(
    { search },
    { skip: !search }
  );
  const { data: infiniteEvents } = useGetEventsInfiniteQuery(
    { search },
    { skip: !search }
  );
  const events =
    infiniteEvents?.pages.flat().flatMap((response) => response.events) ?? [];
  const { data = [] } = useGetSocietiesQuery({ search }, { skip: !search });
  const societies = data && !("error" in data) ? data : [];

  // Limit each section to top 5 results
  const topPeople = people.slice(0, 5);
  const topEvents = events.slice(0, 5);
  const topSocieties = societies.slice(0, 5);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Delay closing to allow clicking on results
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const handleItemClick = () => {
    // Clear the timeout and close immediately when an item is clicked
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const hasResults =
    topPeople.length > 0 || topEvents.length > 0 || topSocieties.length > 0;
  const showFlyout = isOpen && search.trim();

  return (
    <div className="relative" ref={searchRef}>
      <SearchInput
        placeholder="Search people, events, and societies"
        className="xl:w-xl w-full"
        value={input}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      {showFlyout && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {hasResults ? (
            <div className="max-h-96 overflow-y-auto">
              {/* People Section */}
              <SearchSection
                title="People"
                icon={User}
                count={topPeople.length}
              >
                {topPeople.map((person) => (
                  <PersonItem
                    key={person.id}
                    person={person}
                    onClick={handleItemClick}
                  />
                ))}
              </SearchSection>

              {/* Events Section */}
              <SearchSection
                title="Events"
                icon={Calendar}
                count={topEvents.length}
              >
                {topEvents.map((event: Event) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    onClick={handleItemClick}
                  />
                ))}
              </SearchSection>

              {/* Societies Section */}
              <SearchSection
                title="Societies"
                icon={Users}
                count={topSocieties.length}
              >
                {topSocieties.map((society: Society) => (
                  <SocietyItem
                    key={society.id}
                    society={society}
                    onClick={handleItemClick}
                  />
                ))}
              </SearchSection>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <SearchIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No results found for "{search}"</p>
              <p className="text-xs text-gray-400 mt-1">
                Try searching with different keywords
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
