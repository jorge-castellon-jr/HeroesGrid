export type AccountType = 'admin' | 'editor' | 'user'

type UserLike = {
  accountType?: AccountType | null
  discordId?: string | null
}

/**
 * Temporary compatibility:
 * - Older CMS accounts may not have `accountType` set yet.
 * - Treating "no accountType + no discordId" as admin lets you log into /admin
 *   and update existing users without locking yourself out.
 *
 * Once you've assigned account types, you can remove this fallback if desired.
 */
export function getEffectiveAccountType(user: UserLike | null | undefined): AccountType | null {
  if (!user) return null
  if (user.accountType === 'admin' || user.accountType === 'editor' || user.accountType === 'user') {
    return user.accountType
  }
  if (!user.discordId) return 'admin'
  return 'user'
}

export function isAdmin(user: UserLike | null | undefined): boolean {
  return getEffectiveAccountType(user) === 'admin'
}

export function isEditorOrAdmin(user: UserLike | null | undefined): boolean {
  const t = getEffectiveAccountType(user)
  return t === 'admin' || t === 'editor'
}

