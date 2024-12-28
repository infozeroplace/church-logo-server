import { Package } from "../model/package.model.js";

const generatePackageId = async (data) => {

  const formattedTitle = data.title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

  // Check if the packageId already exists in the collection
  const existingPackage = await Package.findOne({ packageId: formattedTitle });

  if (!existingPackage) {
    return formattedTitle;
  }

  return false;
};

export default generatePackageId;
