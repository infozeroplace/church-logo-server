import { Schema, model } from "mongoose";
import mongoosePlugin from "mongoose-aggregate-paginate-v2";

const GallerySchema = Schema(
  {
    urls: [
      {
        uid: String,
        url: String,
      },
    ],
    category: { type: String, required: true },
    serialId: { type: Number, required: true },
    showBorder: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

GallerySchema.plugin(mongoosePlugin);

const Gallery = model("Gallery", GallerySchema);

export { Gallery };
