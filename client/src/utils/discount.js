/**
 * Calculates total price applying a 5% discount for registered customers.
 * @param {number|string} total Original total amount
 * @param {boolean} isRegistered User registration status
 * @returns {number} Final total amount rounded to 2 decimal places
 */
export const applyDiscount = (total, isRegistered) => {
  const numericTotal = parseFloat(total) || 0;
  if (isRegistered) {
    return Math.round(numericTotal * 0.95 * 100) / 100;
  }
  return Math.round(numericTotal * 100) / 100;
};
