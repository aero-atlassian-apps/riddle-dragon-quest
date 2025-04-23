
/**
 * Calculate door states based on tokens left
 * @param tokensLeft Number of tokens left
 * @returns Array of boolean values representing door states
 */
export const calculateDoorStates = (tokensLeft: number = 0): boolean[] => {
  return [
    tokensLeft >= 1, // First door is opened if at least 1 token is left
    tokensLeft >= 2, // Second door is opened if at least 2 tokens are left
    tokensLeft >= 3  // Third door is opened if at least 3 tokens are left
  ];
};
