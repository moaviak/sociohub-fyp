import { ScrollView } from "react-native";
import { useGetSocietyRolesQuery } from "./api";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { VStack } from "@/components/ui/vstack";
import { RoleCard } from "./components/role-card";
import { Fab, FabIcon, FabLabel } from "@/components/ui/fab";
import { AddIcon } from "@/components/ui/icon";
import { useState } from "react";
import { RoleForm } from "./role-form";

const Roles = () => {
  const [showRoleForm, setShowRoleForm] = useState(false);
  const societyId = useGetSocietyId();
  const { data: roles, isLoading } = useGetSocietyRolesQuery({ societyId });

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 p-6"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <VStack space="md">
          {isLoading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <RoleCard.Skeleton key={`skeleton-${idx}`} />
              ))
            : roles?.map((role) => <RoleCard key={role.id} role={role} />)}
        </VStack>
      </ScrollView>
      <Fab
        size="md"
        placement="bottom right"
        onPress={() => setShowRoleForm(true)}
      >
        <FabIcon as={AddIcon} />
        <FabLabel>Create New</FabLabel>
      </Fab>

      {showRoleForm && (
        <RoleForm open={showRoleForm} setOpen={setShowRoleForm} />
      )}
    </>
  );
};

export default Roles;
