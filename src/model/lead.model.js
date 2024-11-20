import { Schema, model } from "mongoose";
import mongoosePlugin from "mongoose-aggregate-paginate-v2";

const leadSchema = Schema(
  {
    pathname: String,
    ip: String,
    city: String,
    region: String,
    regionType: String,
    countryName: String,
    continentName: String,
    latitude: String,
    longitude: String,
    postal: String,
    callingCode: String,
    flag: String,
    currentTime: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

leadSchema.plugin(mongoosePlugin);

const Lead = model("Lead", leadSchema);

export { Lead };
