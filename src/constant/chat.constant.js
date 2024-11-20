export const conversationSearchableFields = [
  "creator.firstName",
  "creator.lastName",
  "creator.userId",
  "participant.firstName",
  "participant.lastName",
  "participant.userId",
];

export const conversationFilterableField = [
  "searchTerm",
  "creator.firstName",
  "creator.lastName",
  "creator.email",
  "creator.userId",
  "creator.role",
  "participant.firstName",
  "participant.lastName",
  "participant.email",
  "participant.userId",
  "participant.role",
  "lastUpdated",
  "messageType",
  "userId"
];

export const messageSearchableFields = [
  "sender.firstName",
  "sender.lastName",
  "sender.email",
  "sender.userId",
  "receiver.firstName",
  "receiver.lastName",
  "receiver.email",
  "receiver.userId",
];

export const messageFilterableField = [
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
  "conversationId",
  "messageType",
  "isRead",
];

export const messageTypes = [
  "client",
  "super-admin-admin",
  "super-admin-moderator",
  "admin-admin",
  "admin-moderator",
  "moderator-moderator",
];
