/**
 * Generates a unique image file name.
 * @param {string} originalName - The original file name (e.g., "john.jpg").
 * @returns {string} - A unique file name (e.g., "john_1695678742345.jpg").
 */

const generateUniqueImageName = (originalName) => {
  // Extract the name and extension from the original file name
  const name = originalName.split(".")[0].toLowerCase();

  // Get the current timestamp
  const timestamp = Date.now();

  // Combine everything to create a unique file name
  return `${name}__${timestamp}`;
};

export default generateUniqueImageName;
