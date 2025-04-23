
/**
 * Generate a unique room ID
 * @returns A unique string ID for a room
 */
export const generateRoomId = (): string => {
  // Generate a random string that looks like a UUID
  // This is a simple implementation and not cryptographically secure
  return Math.random().toString(36).substring(2, 9);
};
