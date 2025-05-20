import { HowToUseChurchLogo } from "../model/howToUseChurchLogo.js";

const generateHowToUseChurchLogoId = async (data) => {
  const formattedTitle = data.headTitle
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

  // Check if the packageId already exists in the collection
  const existing = await HowToUseChurchLogo.findOne({
    hId: formattedTitle,
  });

  if (!existing) {
    return formattedTitle;
  }

  return false;
};

export default generateHowToUseChurchLogoId;
