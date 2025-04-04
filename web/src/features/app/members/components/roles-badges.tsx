import { Role } from "@/types";
import { Badge } from "@/components/ui/badge";

interface RolesBadgesProps {
  roles: Role[];
}

export const RolesBadges = ({ roles }: RolesBadgesProps) => {
  return (
    <div>
      {roles.slice(0, 2).map((role, index) => (
        <Badge
          key={role.id}
          className={
            index % 2 === 0
              ? "bg-secondary-100 border-secondary-400 text-secondary-600"
              : "bg-accent-100 border-accent-400 text-accent-600"
          }
        >
          {role.name}
        </Badge>
      ))}
      {roles.length > 2 && (
        <Badge className="bg-primary-100/50 border-primary-400 text-primary-600">
          +{roles.length - 2}
        </Badge>
      )}
    </div>
  );
};
