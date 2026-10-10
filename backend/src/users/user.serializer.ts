import { User } from "@prisma/client";

/** The user shape the frontend's `User` type expects (`src/types/index.ts`). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: User["role"];
  status: User["status"];
  avatarUrl: string | null;
  avatar: string | null;
  createdAt: string;
}

/** Strips `passwordHash` and maps to the public contract. */
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatarUrl: user.avatarUrl ?? null,
    avatar: user.avatarUrl ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

export interface UserSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export function toUserSummary(user: {
  id: string;
  name: string;
  avatarUrl: string | null;
}): UserSummary {
  return { id: user.id, name: user.name, avatarUrl: user.avatarUrl ?? null };
}
