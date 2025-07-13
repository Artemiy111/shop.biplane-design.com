export const userRoles = ['admin', 'user'] as const
export type UserRole = (typeof userRoles)[number]
