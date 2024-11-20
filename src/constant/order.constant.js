export const orderSearchableFields = [
  "user.firstName",
  "user.lastName",
  "user.email",
  "user.userId",
  "package.title",
  "contactDetails.firstName",
  "contactDetails.lastName",
  "contactDetails.phone",
  "contactDetails.country",
  "orderId",
  "packageId",
  "userId",
  "category",
  "email",
  "additionalEmail",
];

export const orderFilterableField = [
  "searchTerm",
  "user.firstName",
  "user.lastName",
  "user.email",
  "user.userId",
  "contactDetails.firstName",
  "contactDetails.lastName",
  "contactDetails.phone",
  "contactDetails.country",
  "package.title",
  "orderId",
  "packageId",
  "userId",
  "category",
  "email",
  "orderStatus",
  "additionalEmail",
];

export const orderStatus = [
  "in progress",
  "delivered",
  "revision",
  "completed",
];

export const orderMessageSearchableFields = [
  "sender.firstName",
  "sender.lastName",
  "sender.email",
  "sender.userId",
  "receiver.firstName",
  "receiver.lastName",
  "receiver.email",
  "receiver.userId",
];


export const orderMessageFilterableField = [
  "searchTerm",
  "sender.firstName",
  "sender.lastName",
  "sender.email",
  "sender.userId",
  "sender.role",
  "receiver.firstName",
  "receiver.lastName",
  "receiver.email",
  "receiver.userId",
  "receiver.role",
  "conversation",
  "order",
  "messageType",
  "isRead",
];