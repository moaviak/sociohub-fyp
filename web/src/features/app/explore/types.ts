import { Society } from "@/types";

export type Societies = [
  Society & { isMember: boolean; hasRequestedToJoin: boolean }
];
