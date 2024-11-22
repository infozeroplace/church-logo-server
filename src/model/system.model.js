import { model, Schema } from "mongoose";

const SystemSchema = Schema(
  {
    systemId: {
      type: String,
      default: "system-1",
    },
    gallery: {
      logoDesign: Array,
    },
    generalFaqs: Array,
    categoryFaqs: {
      logoDesign: Array,
      webDesign: Array,
      branding: Array,
      personalSignature: Array,
      businessAdvertising: Array,
      socialMediaService: Array,
    },
    categorySettings: {
      logoDesignThumbnail: String,
      webDesignThumbnail: String,
      brandingThumbnail: String,
      personalSignatureThumbnail: String,
      businessAdvertisingThumbnail: String,
      socialMediaServiceThumbnail: String,
      logoDesignThumbnail2: String,
      webDesignThumbnail2: String,
      brandingThumbnail2: String,
      personalSignatureThumbnail2: String,
      businessAdvertisingThumbnail2: String,
      socialMediaServiceThumbnail2: String,
    },
    orderSettings: {
      designSample: Array,
      colorSample: Array,
    },
    privacyPolicy: {
      heading: String,
      content: String,
      lastUpdate: String,
    },
    termsAndConditions: {
      heading: String,
      content: String,
      lastUpdate: String,
    },
    homeSettings: {
      offerText: String,
      bannerTitle: String,
      bannerDescription: String,
      bannerImages: Array,
      categoryTitle: String,
      categoryDescription: String,
      categoryLogoDesignThumbnail: String,
      categoryLogoDesignVisibility: Boolean,
      categoryWebDesignThumbnail: String,
      categoryWebDesignVisibility: Boolean,
      categoryBrandingThumbnail: String,
      categoryBrandingVisibility: Boolean,
      categoryPersonalSignatureThumbnail: String,
      categoryPersonalSignatureVisibility: Boolean,
      categoryBusinessAdvertisingThumbnail: String,
      categoryBusinessAdvertisingVisibility: Boolean,
      categorySocialMediaServiceThumbnail: String,
      categorySocialMediaServiceVisibility: Boolean,
      portfolios: Array,
      service: {
        serviceTitle: String,
        services: Array,
      },
      zeroPlacePromotional: {
        title: String,
        description: String,
        thumbnail: Array,
        background: Array,
      },
      showCaseLogo: {
        title: String,
        slideImages: Array,
      },
      customersDoing: {
        title: String,
        slideImages: Array,
      },
      personalSignature: {
        title: String,
        thumbnail: Array,
        points: Array,
      },
    },
    aboutUsSettings: {
      title1: String,
      title2: String,
      paragraph1: String,
      paragraph2: String,
      paragraph3: String,
      paragraph4: String,
      points: Array,
    },
    contactUsSettings: {
      title1: String,
      title2: String,
      paragraph: String,
      thumbnail: String,
      background: String,
    },
    faqThumbnail: String,
    contactUsThumbnail: String,
    logo: String,
    packageOfferPercentages: Number,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

const System = model("System", SystemSchema);

export { System };
