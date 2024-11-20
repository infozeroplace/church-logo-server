import { model, Schema } from "mongoose";
import mongoosePlugin from "mongoose-aggregate-paginate-v2";

const ReviewSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: "Package",
    },
    ratingPoints: {
      type: Number,
      min: [1, "Too small"],
      max: [5, "Too big"],
      required: [true, "Rating point is required!"],
    },
    communicationRatings: {
      type: Number,
      min: [1, "Too small"],
      max: [5, "Too big"],
      required: [true, "Communication rating point is required!"],
    },
    serviceRatings: {
      type: Number,
      min: [1, "Too small"],
      max: [5, "Too big"],
      required: [true, "Service rating point is required!"],
    },
    recommendedRatings: {
      type: Number,
      min: [1, "Too small"],
      max: [5, "Too big"],
      required: [true, "Recommended rating point is required!"],
    },
    approved: {
      type: Boolean,
      default: false,
    },
    date: {
      type: String,
      trim: true,
    },
    productImageUrl: {
      type: String,
      trim: true,
      // match: [/(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, "Invalid URL format"],
      required: [true, "Product image url is required!"],
    },
    reviewText: {
      type: String,
      trim: true,
      required: [true, "Review is required!"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

ReviewSchema.plugin(mongoosePlugin);

const Review = model("Review", ReviewSchema);

export { Review };
