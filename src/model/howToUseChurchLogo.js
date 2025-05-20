import { Schema, model } from "mongoose";
import mongoosePlugin from "mongoose-aggregate-paginate-v2";

const howToUseChurchLogoSchema = Schema(
  {
    hId: {
      type: String,
      trim: true,
      required: [true, "hId is required!"],
    },
    headTitle: {
      type: String,
      trim: true,
      required: [true, "Head title is required"],
    },
    subTitle: {
      type: String,
      trim: true,
      required: [true, "Sub title is required"],
    },
    shortDesc: {
      type: String,
      trim: true,
      required: [true, "Short description is required"],
    },
    content: {
      type: String,
      trim: true,
      required: [true, "Content is required"],
    },
    thumbnail: {
      type: String,
      trim: true,
      required: [true, "URL is required"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

howToUseChurchLogoSchema.plugin(mongoosePlugin);

const HowToUseChurchLogo = model(
  "HowToUseChurchLogo",
  howToUseChurchLogoSchema
);

export { HowToUseChurchLogo };
