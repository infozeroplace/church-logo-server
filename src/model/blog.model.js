import { Schema, model } from "mongoose";
import mongoosePlugin from "mongoose-aggregate-paginate-v2";

const blogSchema = Schema(
  {
    bId: {
      type: String,
      trim: true,
      required: [true, "bId is required!"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Description is required"],
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
    metaTitle: {
      type: String,
      trim: true,
      required: [true, "Meta title is required"],
    },
    metaDescription: {
      type: String,
      trim: true,
      required: [true, "Meta description is required"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

blogSchema.plugin(mongoosePlugin);

const Blog = model("Blog", blogSchema);

export { Blog };
