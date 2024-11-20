import { System } from "../../model/system.model.js";

const getSystemConfig = async () => {
  const result = await System.findOne({ systemId: "system-1" });

  if (!result) {
    return null;
  } else {
    let obj = result.toObject();

    const sortedDesignSample = obj?.orderSettings?.designSample.sort(
      (a, b) => a?.serialId - b?.serialId
    );
    const sortedColorSample = obj?.orderSettings?.colorSample.sort(
      (a, b) => a?.serialId - b?.serialId
    );
    const sortedBannerImages = obj?.homeSettings?.bannerImages.sort(
      (a, b) => a?.serialId - b?.serialId
    );

    obj = {
      ...obj,
      orderSettings: {
        designSample: sortedDesignSample,
        colorSample: sortedColorSample,
      },
      homeSettings: {
        ...obj?.homeSettings,
        bannerImages: sortedBannerImages,
      },
    };

    return obj;
  }
};

export const SystemService = {
  getSystemConfig,
};
