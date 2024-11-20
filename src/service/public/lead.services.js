import { Lead } from "../../model/lead.model.js";

const lead = async (payload) => {
  const { pathname, ip } = payload;

  const isExist = await Lead.findOne({
    pathname,
    ip,
  });

  if (!isExist) {
    const result = await Lead.create(payload);
    return result;
  }

  return null;
};

export const LeadService = {
  lead,
};
