import { model, Schema } from "mongoose";
import mongoosePlugin from "mongoose-aggregate-paginate-v2";
import { packageCategories } from "../constant/package.constant.js";

const PackageSchema = Schema(
  {
    styleClass: {
      type: String,
      required: [true, "Style class is required!"],
    },
    serialId: {
      type: Number,
      required: [true, "Serial id is required!"],
    },
    packageId: {
      type: String,
      trim: true,
      required: [true, "Package id is required!"],
    },
    createdBy: {
      type: String,
      trim: true,
      required: [true, "Created by is required!"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Title is required!"],
    },
    headTitle: {
      type: String,
      trim: true,
      required: [true, "headTitle is required!"],
    },
    subTitle: {
      type: String,
      trim: true,
      required: [true, "subTitle is required!"],
    },
    previewTitle: {
      type: String,
      trim: true,
      required: [true, "previewTitle is required!"],
    },
    thumbnail1: {
      type: String,
      trim: true,
      required: [true, "thumbnail 1 is required!"],
    },
    thumbnail2: {
      type: String,
      trim: true,
      required: [true, "thumbnail 2 is required!"],
    },
    category: {
      type: String,
      trim: true,
      enum: {
        values: packageCategories,
        message: "{VALUE} is not matched",
      },
      required: [true, "Category is required!"],
    },
    isPopular: {
      type: Boolean,
      required: [true, "Popular type is required!"],
    },
    basePrice: {
      type: Number,
      required: [true, "Base price is required!"],
    },
    savings: {
      type: Number,
      required: [true, "Savings is required!"],
    },
    featuredItems: {
      type: Array,
      required: [true, "Featured item is required!"],
    },
    featuredRevision: {
      type: String,
      trim: true,
      required: [true, "Featured revision is required!"],
    },
    featuredDeliveryTime: {
      type: String,
      trim: true,
      required: [true, "Featured featured delivery time is required!"],
    },
    featuredProgrammingLangs: {
      type: Array,
      required: [true, "Featured language is required!"],
    },
    additionalProgrammingLangs: {
      type: Array,
      required: [true, "Additional language is required!"],
    },
    additionalFeatures: {
      type: Array,
    },
    revisions: {
      type: Array,
    },
    deliveryTimes: {
      type: Array,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

PackageSchema.plugin(mongoosePlugin);

const Package = model("Package", PackageSchema);

export { Package };
