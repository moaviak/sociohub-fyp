import { useAppSelector } from "@/app/hooks";
import { PRIVILEGES } from "@/data";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { cn } from "@/lib/utils";
import { Society } from "@/types";
import { CreditCard, IdCard, Users } from "lucide-react";
import { Link, useLocation } from "react-router";

const getNavItems = (
  isAdvisor: boolean,
  society?: Society & { privileges: string[] }
) => [
  ...(society?.privileges.includes(PRIVILEGES.SOCIETY_SETTINGS_MANAGEMENT) ||
  isAdvisor
    ? [
        {
          label: "Public Profile",
          icon: <IdCard className="w-4 h-4" />,
          href: "profile",
        },
        {
          label: "Members & Requests",
          icon: <Users className="w-4 h-4" />,
          href: "members",
        },
      ]
    : []),
  ...(society?.privileges.includes(PRIVILEGES.PAYMENT_FINANCE_MANAGEMENT) ||
  isAdvisor
    ? [
        {
          label: "Payment Settings",
          icon: <CreditCard className="w-4 h-4" />,
          href: "payments",
        },
      ]
    : []),
];

const Sidebar = () => {
  const location = useLocation();
  const societyId = useGetSocietyId();
  const { user } = useAppSelector((state) => state.auth);
  const society =
    user && "registrationNumber" in user
      ? user.societies?.find((society) => society.society.id === societyId)
      : undefined;

  return (
    <div className="flex flex-col gap-y-2 py-4">
      {getNavItems(!("registrationNumber" in user!), society?.society).map(
        (item) => {
          const isActive = location.pathname.includes(item.href);
          return (
            <Link
              to={`${societyId || ""}/${item.href}`}
              key={item.href}
              className={cn(
                "flex gap-x-2 b3-regular justify-start items-center rounded-md p-3",
                isActive && "bg-primary-600 text-white"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        }
      )}
    </div>
  );
};
export default Sidebar;
