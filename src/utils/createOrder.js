import httpStatus from "http-status";
import ApiError from "../error/ApiError.js";
import { dateFormatter } from "../helper/dateFormatter.js";
import { Order } from "../model/order.model.js";
import { Package } from "../model/package.model.js";
import User from "../model/user.model.js";
import calculateAdditionalItemPrice from "../utils/calculateAdditionalItemPrice.js";
import calculateDeliveryDate from "../utils/calculateDeliveryDate.js";
import calculateRevisionCount from "../utils/calculateRevisionCount.js";
import generateOrderId from "../utils/generateOrderId.js";
import packagePriceConversion from "../utils/packagePriceConversion.js";

export const createOrder = async (payload, userId) => {
  const {
    userId: givenUserId,
    packageId,
    category,
    contactDetails,
    additionalEmail,
    requirements = [],
    referredImages = [],
    preferredColors = [],
    preferredDesigns = [],
    selectedAdditionalFeats = [],
    selectedAdditionalRevision = [],
    selectedAdditionalDeliveryTime = [],
    selectedProgrammingLang = [],
  } = payload;

  if (givenUserId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "User ID doesn't match!");
  }

  const existingUser = await User.findOne({ userId: givenUserId });

  if (!existingUser) {
    throw new ApiError(httpStatus.FORBIDDEN, "User doesn't exist!");
  }

  const existingPackage = await Package.findOne({ packageId });

  if (!existingPackage) {
    throw new ApiError(httpStatus.FORBIDDEN, "Package doesn't exist!");
  }

  const { UTC, dateString } = dateFormatter.getDates();

  const packagePrice = packagePriceConversion(existingPackage);

  const additionalFeatsPrice = calculateAdditionalItemPrice(
    selectedAdditionalFeats
  );

  const additionalRevisionPrice = calculateAdditionalItemPrice(
    selectedAdditionalRevision
  );

  const additionalDeliveryPrice = calculateAdditionalItemPrice(
    selectedAdditionalDeliveryTime
  );

  const additionalProgrammingLangPrice = calculateAdditionalItemPrice(
    selectedProgrammingLang
  );

  const totalPrice = Number(
    (
      packagePrice +
      additionalFeatsPrice +
      additionalRevisionPrice +
      additionalDeliveryPrice +
      additionalProgrammingLangPrice
    ).toFixed(2)
  );

  const { featuredRevision, featuredDeliveryTime } = existingPackage;

  const totalRevision = calculateRevisionCount(
    +featuredRevision?.split(" ")[0],
    selectedAdditionalRevision
  );

  const { deliveryDateUTC, deliveryDateString } = calculateDeliveryDate(
    +featuredDeliveryTime?.split(" ")[0],
    selectedAdditionalDeliveryTime
  );

  const orderId = await generateOrderId();

  const newOrder = {
    user: existingUser._id,
    package: existingPackage._id,
    contactDetails: contactDetails,
    orderId: orderId,
    packageId: packageId,
    userId: userId,
    category: category,
    email: existingUser.email,
    orderStatus: "in progress",
    additionalEmail: additionalEmail,
    referredImages: referredImages,
    requirements: requirements,
    preferredDesigns: preferredDesigns,
    preferredColors: preferredColors,
    additionalFeature: selectedAdditionalFeats,
    additionalRevision: selectedAdditionalRevision,
    additionalDeliveryTime: selectedAdditionalDeliveryTime,
    additionalProgrammingLang: selectedProgrammingLang,
    totalRevision: totalRevision,
    usedRevision: 0,
    packagePrice: packagePrice,
    totalPrice: totalPrice,
    orderDateUTC: UTC,
    orderDateString: dateString,
    deliveryDateUTC: deliveryDateUTC,
    deliveryDateString: deliveryDateString,
  };

  const createdOrder = await Order.create(newOrder);

  return {
    packageTitle: existingPackage.title,
    totalPrice: totalPrice,
    additionalEmail: additionalEmail,
    orderId: orderId
  };
};
