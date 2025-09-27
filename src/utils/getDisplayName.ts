export function getDisplayName(
    firstName?: string,
    lastName?: string,
    username?: string
  ): string {
    if (firstName?.trim()) return firstName;
    if (lastName?.trim()) return lastName;
    if (username?.trim()) return username;
    return "";
  }