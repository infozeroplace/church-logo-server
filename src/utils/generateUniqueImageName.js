import crypto from "crypto";

/**
 * Generates a unique image file name.
 * @param {string} originalName - The original file name (e.g., "john.jpg").
 * @returns {string} - A unique file name (e.g., "john_1695678742345_1d4e5f.jpg").
 */

const generateUniqueImageName = (originalName) => {
  // Extract the name and extension from the original file name
  const name = originalName.split(".")[0];

  // Get the current timestamp
  const timestamp = Date.now();

  // Generate a random string
  const randomString = crypto.randomBytes(8).toString("hex");

  // Combine everything to create a unique file name
  return `${name}__${timestamp}_${randomString}`;
};

export default generateUniqueImageName;
