import type { CheckedUser } from "../meeting-form";

export const InvitedMembersChips = ({
  checkedUsers,
  setCheckedUsers,
}: {
  checkedUsers: CheckedUser[];
  setCheckedUsers: React.Dispatch<React.SetStateAction<CheckedUser[]>>;
}) => {
  const handleRemove = (id: string) => {
    setCheckedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  if (checkedUsers.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {checkedUsers.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full shadow text-sm"
        >
          {user.avatar && (
            <img
              src={user.avatar}
              alt={user.firstName + " " + user.lastName}
              className="w-6 h-6 rounded-full object-cover"
            />
          )}
          <span>
            {user.firstName} {user.lastName}
          </span>
          <button
            type="button"
            className="ml-1 text-gray-500 hover:text-red-500 focus:outline-none"
            onClick={() => handleRemove(user.id)}
            aria-label="Remove"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};
