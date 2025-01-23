import httpStatus from "http-status";
import ApiError from "../../error/ApiError.js";
import cloudinary from "../../middleware/cloudinary.js";
import { Package } from "../../model/package.model.js";
import { System } from "../../model/system.model.js";
import { removeImage } from "../../utils/fileSystem.js";

const getCategoryServices = async (query) => {
  const allPackagesByCategory = await Package.find({
    category: query.category,
  });

  // Use a Map to store unique features with case-insensitivity
  const uniqueFeaturesMap = new Map();

  // Flatten and process all features in a single loop
  allPackagesByCategory.forEach((pkg) => {
    pkg.featuredItems.forEach((item) => {
      const lowerCaseItem = item.toLowerCase();
      if (!uniqueFeaturesMap.has(lowerCaseItem)) {
        uniqueFeaturesMap.set(lowerCaseItem, item); // Preserve original case
      }
    });

    pkg.additionalFeatures.forEach((feature) => {
      const lowerCaseLabel = feature.label.toLowerCase();
      if (!uniqueFeaturesMap.has(lowerCaseLabel)) {
        uniqueFeaturesMap.set(lowerCaseLabel, feature.label); // Preserve original case
      }
    });
  });

  // Convert Map values to an array and sort alphabetically
  return {
    packageList: allPackagesByCategory,
    services: Array.from(uniqueFeaturesMap.values()).sort((a, b) =>
      a.localeCompare(b)
    ),
  };
};

const updateContactUsSettings = async (payload) => {
  const existing = await System.findOne({
    systemId: "system-1",
  });
  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      contactUsSettings: payload,
    });
    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");
    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: { contactUsSettings: payload },
      },
      { new: true }
    );
    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");
    return result;
  }
};

const updateAboutUsSettings = async (payload) => {
  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      aboutUsSettings: payload,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: { aboutUsSettings: payload },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  }
};

const updateLogo = async (payload) => {
  const { url } = payload;

  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      logo: url,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: { logo: url },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    await removeImage(existing.logo);

    return result;
  }
};

const updatePackageOfferPercentages = async (payload) => {
  const { packageOfferPercentages } = payload;

  const allowedPercentages = [10, 15, 20, 25, 30, 35, 40, 45, 50];

  if (!allowedPercentages.includes(packageOfferPercentages)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Amount not accepted");
  }

  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      packageOfferPercentages,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: { packageOfferPercentages },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  }
};

const updateContactUsThumbnail = async (payload) => {
  const { url } = payload;

  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      contactUsThumbnail: url,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: { contactUsThumbnail: url },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  }
};

const updateGeneralFaqThumbnail = async (payload) => {
  const { url } = payload;

  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      faqThumbnail: url,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: { faqThumbnail: url },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  }
};

const updateGeneralFaq = async (payload) => {
  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      generalFaqs: payload,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: {
          generalFaqs: payload,
        },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  }
};

const updateCategoryFaq = async (payload) => {
  const { category, faqs } = payload;

  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      categoryFaqs: {
        [category]: faqs,
      },
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: {
          categoryFaqs: {
            ...existing?.categoryFaqs,
            [category]: faqs,
          },
        },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  }
};

const updateCategoryThumbnail = async (payload) => {
  const { categoryTitle, thumbnailUrl } = payload;

  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      categorySettings: {
        [categoryTitle]: thumbnailUrl,
      },
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: {
          categorySettings: {
            ...existing?.categorySettings,
            [categoryTitle]: thumbnailUrl,
          },
        },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    await removeImage(existing.categorySettings[categoryTitle]);

    return result;
  }
};

const updateGalleryImages = async (payload) => {
  const { data, files } = payload;
  const { category } = data;

  const existingGalleryImages = data.logoDesign
    ? Array.isArray(data.logoDesign)
      ? data.logoDesign
      : [data.logoDesign]
    : [];

  data.logoDesign = existingGalleryImages.map((img) => {
    let parsedImg = img;
    if (typeof img === "string") {
      parsedImg = JSON.parse(img);
    }
    return parsedImg;
  });

  if (files.length) {
    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const result = await cloudinary.v2.uploader.upload(file.path, {
          folder: "church-logo/gallery/logo-design",
          use_filename: true,
        });
        return { url: result.secure_url, uid: result.public_id };
      })
    );

    data[category] = [...data.logoDesign, ...uploadedImages];
  }

  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      gallery: data,
    });
    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");
    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: {
          gallery: {
            ...existing?.gallery,
            ...data,
          },
        },
      },
      { new: true }
    );
    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");
    return result;
  }
};

const getSystemConfiguration = async (payload) => {
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

const updateOrderSettings = async (payload) => {
  const { designSample, psDesignSample, colorSample } = payload;

  // Find existing system by systemId
  let system = await System.findOne({ systemId: "system-1" });

  // If the system does not exist, create a new one
  if (!system) {
    system = await System.create({
      systemId: "system-1",
      orderSettings: payload,
    });

    if (!system) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Failed to create system settings"
      );
    }

    return system; // Return the newly created system document
  }

  // Helper function to filter and delete from Cloudinary
  const filterAndDelete = async (existingSamples, newSamples) => {
    const filteredSamples = existingSamples?.filter(
      (item) => !newSamples.some((newItem) => newItem.uid === item.uid)
    );

    if (filteredSamples?.length) {
      for (const item of filteredSamples) {
        // Deleting the item from Cloudinary
        await cloudinary.v2.uploader.destroy(item.publicId);
      }
    }
  };

  // Handle existing samples if system exists
  await filterAndDelete(system?.orderSettings?.designSample, designSample);
  await filterAndDelete(system?.orderSettings?.psDesignSample, psDesignSample);
  await filterAndDelete(system?.orderSettings?.colorSample, colorSample);

  // Update order settings with the new payload
  const updatedSystem = await System.findOneAndUpdate(
    { systemId: "system-1" },
    { orderSettings: payload },
    { new: true }
  );

  if (!updatedSystem) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Failed to update system settings"
    );
  }

  return updatedSystem; // Return the updated system document
};

const updateHomePersonalSignatureSettings = async (payload) => {
  const { data, file } = payload;

  if (file) {
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: "church-logo/home/personal-signature-thumbnail",
      use_filename: true,
    });

    data.thumbnail = [{ url: result.secure_url }];
  }

  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      homeSettings: data,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: {
          homeSettings: {
            ...existing?.homeSettings,
            personalSignature: {
              ...existing?.homeSettings?.personalSignature,
              ...data,
            },
          },
        },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  }
};

const updateHomeCustomersDoingSettings = async (payload) => {
  const { data, files } = payload;

  data.slideImages = (data.slideImages || []).map((slide) => {
    let parsedSlideImg = slide;
    if (typeof slide === "string") {
      parsedSlideImg = JSON.parse(slide);
    }
    return parsedSlideImg;
  });

  if (files.length) {
    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const result = await cloudinary.v2.uploader.upload(file.path, {
          folder: "church-logo/home/customers-doing",
          use_filename: true,
        });
        return { url: result.secure_url };
      })
    );

    data.slideImages = [...data.slideImages, ...uploadedImages];
  }

  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      homeSettings: data,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: {
          homeSettings: {
            ...existing?.homeSettings,
            customersDoing: {
              ...existing?.homeSettings?.customersDoing,
              ...data,
            },
          },
        },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  }
};

const updateHomeShowCaseLogoSettings = async (payload) => {
  const { data, files } = payload;

  data.slideImages = (data.slideImages || []).map((slide) => {
    let parsedSlideImg = slide;
    if (typeof slide === "string") {
      parsedSlideImg = JSON.parse(slide);
    }
    return parsedSlideImg;
  });

  if (files.length) {
    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const result = await cloudinary.v2.uploader.upload(file.path, {
          folder: "church-logo/home/showcase",
          use_filename: true,
        });
        return { url: result.secure_url };
      })
    );

    data.slideImages = [...data.slideImages, ...uploadedImages];
  }

  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      homeSettings: data,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: {
          homeSettings: {
            ...existing?.homeSettings,
            showCaseLogo: {
              ...existing?.homeSettings?.showCaseLogo,
              ...data,
            },
          },
        },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  }
};

const updateHomeZeroPlacePromotionalSettings = async (payload) => {
  const { data, files } = payload;

  if (files.length) {
    for (const file of files) {
      const result = await cloudinary.v2.uploader.upload(file.path, {
        folder: "church-logo/home/zero-place-promotional",
        use_filename: true,
      });

      for (const [key, value] of Object.entries(data)) {
        if (value === file.uid) {
          data[key] = [{ url: result.secure_url }];
          break;
        }
      }
    }
  }

  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      homeSettings: data,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: {
          homeSettings: {
            ...existing?.homeSettings,
            zeroPlacePromotional: {
              ...existing?.homeSettings?.zeroPlacePromotional,
              ...data,
            },
          },
        },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  }
};

const updateHomePortfolioSettings = async (payload) => {
  const { data, files } = payload;

  if (!files.length) {
    data.portfolios = data.portfolios.map((portfolio) => {
      let parsedThumbnail = portfolio.thumbnail;
      if (typeof portfolio.thumbnail === "string") {
        parsedThumbnail = JSON.parse(portfolio.thumbnail);
      }
      return {
        ...portfolio,
        thumbnail: parsedThumbnail,
      };
    });
  } else {
    const portfolios = [];
    for (const portfolio of data.portfolios) {
      if (portfolio.uid) {
        const file = files.find((item) => item.originalname === portfolio.uid);
        if (file) {
          const result = await cloudinary.v2.uploader.upload(file.path, {
            folder: "church-logo/home/portfolio",
            use_filename: true,
          });
          portfolios.push({
            ...portfolio,
            thumbnail: [{ url: result.secure_url }],
          });
        }
      } else {
        let parsedThumbnail = portfolio.thumbnail;
        if (typeof portfolio.thumbnail === "string") {
          parsedThumbnail = JSON.parse(portfolio.thumbnail);
        }
        portfolios.push({
          ...portfolio,
          thumbnail: parsedThumbnail,
        });
      }
    }

    data.portfolios = portfolios;
  }

  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      homeSettings: data.portfolios,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: {
          homeSettings: {
            ...existing?.homeSettings,
            portfolios: data.portfolios,
          },
        },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  }
};

const updateHomeServiceSettings = async (payload) => {
  const { serviceTitle, services } = payload;

  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    // Create a new document if it doesn't exist
    const result = await System.create({
      systemId: "system-1",
      homeSettings: {
        service: {
          serviceTitle,
          services: services.map(({ title, description, uid, url }) => ({
            ...item,
            url: item.url,
          })),
        },
      },
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    // Update the document
    const result = await System.findOneAndUpdate(
      { systemId: "system-1" },
      {
        $set: {
          homeSettings: {
            ...existing.homeSettings,
            service: {
              serviceTitle,
              services: services.map((item) => ({
                ...item,
                url: item.url,
              })),
            },
          },
        },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    const existingServices = existing.homeSettings.service.services || [];

    // Remove old images if the URL has changed
    for (const service of services) {
      const existingService = existingServices.find(
        (s) => s.uid === service.uid
      );

      if (
        existingService &&
        existingService.url &&
        existingService.url !== service.url
      ) {
        await removeImage(existingService.url);
      }
    }

    return result;
  }
};

const updateHomeCategoryThumbnailSettings = async (payload) => {
  const existing = await System.findOne({
    systemId: "system-1",
  });

  const data = {
    [payload.category]: payload.url,
  };

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      homeSettings: data,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: {
          homeSettings: {
            ...existing?.homeSettings,
            ...data,
          },
        },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    await removeImage(existing.homeSettings[payload.category]);

    return result;
  }
};

const updateHomeCategoryVisibilitySettings = async (payload) => {
  const existing = await System.findOne({
    systemId: "system-1",
  });

  const data = {
    [payload.category]: payload.visibility,
  };

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      homeSettings: data,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: {
          homeSettings: {
            ...existing?.homeSettings,
            ...data,
          },
        },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  }
};

const updateHomeCategoryTextSettings = async (data) => {
  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    const result = await System.create({
      systemId: "system-1",
      homeSettings: data,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: {
          homeSettings: {
            ...existing?.homeSettings,
            ...data,
          },
        },
      },
      { new: true }
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  }
};

const updateHomeSettings = async (payload) => {
  const existing = await System.findOne({
    systemId: "system-1",
  });

  if (!existing) {
    // Correct way to create the document
    const result = await System.create({
      systemId: "system-1",
      homeSettings: payload,
    });

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    return result;
  } else {
    const result = await System.findOneAndUpdate(
      {
        systemId: "system-1",
      },
      {
        $set: {
          homeSettings: {
            ...existing?.homeSettings,
            ...payload,
          },
        },
      },

      { new: true } // Return the updated document
    );

    if (!result)
      throw new ApiError(httpStatus.BAD_REQUEST, "Something went wrong!");

    const filtered = existing?.homeSettings?.bannerImages.filter(
      (item) => !payload.bannerImages.some((item2) => item2.url === item.url)
    );

    if (filtered.length) {
      for (const item of filtered) {
        await removeImage(item.url);
      }
    }

    return result;
  }
};

const updateTermsAndConditions = async (payload) => {
  // Find existing system by systemId
  let system = await System.findOne({ systemId: "system-1" });

  // If the system does not exist, create a new one
  if (!system) {
    system = await System.create({
      systemId: "system-1",
      termsAndConditions: payload,
    });

    if (!system) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Failed to create system settings"
      );
    }

    return system; // Return the newly created system document
  }

  // If the system exists, update the terms and conditions
  const updatedSystem = await System.findOneAndUpdate(
    { systemId: "system-1" },
    { termsAndConditions: payload },
    { new: true }
  );

  if (!updatedSystem) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Failed to update system settings"
    );
  }

  return updatedSystem; // Return the updated system document
};

const updatePrivacyPolicy = async (payload) => {
  // Find existing system by systemId
  let system = await System.findOne({ systemId: "system-1" });

  // If the system does not exist, create a new one
  if (!system) {
    system = await System.create({
      systemId: "system-1",
      privacyPolicy: payload,
    });

    if (!system) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Failed to create system settings"
      );
    }

    return system; // Return the newly created system document
  }

  // If the system exists, update the privacy policy
  const updatedSystem = await System.findOneAndUpdate(
    { systemId: "system-1" },
    { privacyPolicy: payload },
    { new: true }
  );

  if (!updatedSystem) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Failed to update system settings"
    );
  }

  return updatedSystem; // Return the updated system document
};

export const SystemService = {
  getCategoryServices,
  updateContactUsSettings,
  updateAboutUsSettings,
  updateLogo,
  updatePackageOfferPercentages,
  updateContactUsThumbnail,
  updateGeneralFaqThumbnail,
  updateGeneralFaq,
  updateCategoryFaq,
  updateCategoryThumbnail,
  updateGalleryImages,
  updateHomePersonalSignatureSettings,
  updateHomeCustomersDoingSettings,
  updateHomeShowCaseLogoSettings,
  updateHomeZeroPlacePromotionalSettings,
  updateHomePortfolioSettings,
  updateHomeServiceSettings,
  updateHomeCategoryThumbnailSettings,
  updateHomeCategoryVisibilitySettings,
  updateHomeCategoryTextSettings,
  updateOrderSettings,
  updateHomeSettings,
  getSystemConfiguration,
  updateTermsAndConditions,
  updatePrivacyPolicy,
};
