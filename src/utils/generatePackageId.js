import { v4 as uuidv4 } from "uuid";
import { Package } from "../model/package.model.js";

const generatePackageId = async () => {
  let isUnique = false;
  let result;

  while (!isUnique) {
    result = uuidv4().trim();

    // Check if the packageId already exists in the collection
    const existingPackage = await Package.findOne({ packageId: result });

    if (!existingPackage) {
      isUnique = true;
    }
  }

  return result;
};

export default generatePackageId;
