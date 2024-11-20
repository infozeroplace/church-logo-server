import { z } from "zod";

const leadZodSchema = z.object({
  body: z.object({
    pathname: z.string({
      required_error: "pathname is required",
    }),
    ip: z.string({
      required_error: "ip is required",
    }),
    city: z.string({
      required_error: "city is required",
    }),
    region: z.string({
      required_error: "region is required",
    }),
    regionType: z.string({
      required_error: "region type is required",
    }),
    countryName: z.string({
      required_error: "country name is required",
    }),
    continentName: z.string({
      required_error: "continent name is required",
    }),
    latitude: z.number({
      required_error: "latitude is required",
    }),
    longitude: z.number({
      required_error: "longitude is required",
    }),
    postal: z.string({
      required_error: "postal is required",
    }),
    callingCode: z.string({
      required_error: "calling code is required",
    }),
    flag: z.string({
      required_error: "flag is required",
    }),
    currentTime: z.string({
      required_error: "current time is required",
    }),
  }),
});

export const LeadValidation = {
  leadZodSchema,
};
