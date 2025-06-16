import { Server as SocketIOServer } from "socket.io";
import { corsOptions } from "../constant/common.constant.js";
import { Message } from "../model/chat.model.js";
import { OrderMessage } from "../model/order.model.js";

// Initialize socket.io
let io;
let adminsAndClientsOnlineList = [];
let adminsOnlineList = [];

export const addToAdminsAndClientsOnlineList = (userId, socketId, role) =>
  !adminsAndClientsOnlineList.some(
    (user) => user.socketId === socketId && user.userId === userId
  ) && adminsAndClientsOnlineList.push({ userId, socketId, role });

export const removeFromAdminsAndClientsOnlineList = (socketId) =>
  (adminsAndClientsOnlineList = adminsAndClientsOnlineList.filter(
    (user) => user.socketId !== socketId
  ));

export const getUsersFromAdminsAndClientsOnlineList = (userId) => {
  const filteredOnlineUsers = adminsAndClientsOnlineList.filter(
    (u) => u.role === "super_admin" || u.role === "admin" || u.userId === userId
  );

  const filteredSocketIds = filteredOnlineUsers.map((u) => u.socketId);

  return { filteredOnlineUsers, filteredSocketIds };
};

// ............................................................... //
// ............................................................... //

export const addToAdminsOnlineList = (userId, socketId, role) =>
  !adminsOnlineList.some(
    (user) => user.socketId === socketId && user.userId === userId
  ) && adminsOnlineList.push({ userId, socketId, role });

export const removeFromAdminsOnlineList = (socketId) =>
  (adminsOnlineList = adminsOnlineList.filter(
    (user) => user.socketId !== socketId
  ));

export const getUsersFromAdminsOnlineList = (senderId, receiverId) => {
  const filteredAdmins = adminsOnlineList.filter(
    (u) => u.userId === senderId || u.userId === receiverId
  );
  const filteredSocketIds = filteredAdmins.map((u) => u.socketId);
  return { filteredAdmins, filteredSocketIds };
};

export const getTaskCommentators = (assignees) => {
  const filteredAdmins = adminsOnlineList.filter(
    (u) => u.role === "super_admin" || u.role === "admin"
  );

  const filteredCommentators = adminsOnlineList.filter((u) =>
    assignees.includes(u.userId)
  );

  const mergedUsers = [...filteredAdmins, ...filteredCommentators];

  const filteredSocketIds = mergedUsers.map((u) => u.socketId);

  return { mergedUsers, filteredSocketIds };
};

export const getAdminsOnlineList = () => {
  return adminsOnlineList;
};

// ............................................................... //
// ............................................................... //

const initSocketIO = (httpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: corsOptions,
  });

  global.io = io;

  io.on("connection", (socket) => {
    socket.on("addToAdminsOnlineList", (userId, role) => {
      addToAdminsOnlineList(userId, socket.id, role);
      io.emit("getAdminsOnlineList", adminsOnlineList);
    });

    socket.on("adminsAndClientsActivity", (userId, role) => {
      addToAdminsAndClientsOnlineList(userId, socket.id, role);
      io.emit("getAdminsAndClientsOnlineList", adminsAndClientsOnlineList);
    });

    socket.on("adminsActivity", (userId, role) => {
      addToAdminsOnlineList(userId, socket.id, role);
      io.emit("getAdminsOnlineList", adminsOnlineList);
    });

    socket.on("addToAdminsAndClientsOnlineList", (userId, role) => {
      addToAdminsAndClientsOnlineList(userId, socket.id, role);
      io.emit("getAdminsAndClientsOnlineList", adminsAndClientsOnlineList);
    });

    socket.on("seenMessages", async ({ unreadMessages, role }) => {
      if (role && unreadMessages.length) {
        const readMessages = unreadMessages.map((message) => ({
          ...message,
          isRead: true,
        }));

        const ids = unreadMessages
          .filter(
            (message) =>
              message.isRead === false && message.receiver.role === role
          )
          .map((message) => message._id);

        await Message.updateMany(
          { _id: { $in: ids } },
          { $set: { isRead: true } }
        );

        const { filteredSocketIds } = getUsersFromAdminsAndClientsOnlineList(
          unreadMessages[0]?.sender?.userId
        );

        if (filteredSocketIds.length > 0) {
          io.to(filteredSocketIds).emit("getSeenMessages", readMessages);
        }
      }
    });

    socket.on("seenOrderMessages", async ({ unreadMessages, role }) => {
      if (role && unreadMessages.length) {
        const readMessages = unreadMessages.map((message) => ({
          ...message,
          isRead: true,
        }));

        const ids = unreadMessages
          .filter(
            (message) =>
              message.isRead === false && message.receiver.role === role
          )
          .map((message) => message._id);

        await OrderMessage.updateMany(
          { _id: { $in: ids } },
          { $set: { isRead: true } }
        );

        const { filteredSocketIds } = getUsersFromAdminsAndClientsOnlineList(
          unreadMessages[0]?.sender?.userId
        );

        if (filteredSocketIds.length > 0) {
          io.to(filteredSocketIds).emit("getSeenOrderMessages", readMessages);
        }
      }
    });

    socket.on("seenAdminMessages", async ({ unreadMessages, userId }) => {
      if (userId && unreadMessages.length) {
        const readMessages = unreadMessages.map((message) => ({
          ...message,
          isRead: true,
        }));

        const ids = unreadMessages
          .filter(
            (message) =>
              message.isRead === false && message.receiver.userId === userId
          )
          .map((message) => message._id);

        await Message.updateMany(
          { _id: { $in: ids } },
          { $set: { isRead: true } }
        );

        const { filteredSocketIds, filteredAdmins } =
          getUsersFromAdminsOnlineList(
            unreadMessages[0]?.sender?.userId,
            unreadMessages[0]?.receiver?.userId
          );

        if (filteredSocketIds.length > 0) {
          io.to(filteredSocketIds).emit("getSeenAdminMessages", readMessages);
        }
      }
    });

    socket.on("disconnection", () => {
      removeFromAdminsAndClientsOnlineList(socket?.id);
      removeFromAdminsOnlineList(socket?.id);
      io.emit("getAdminsAndClientsOnlineList", adminsAndClientsOnlineList);
      io.emit("getAdminsOnlineList", adminsOnlineList);
    });

    socket.on("disconnect", () => {
      removeFromAdminsAndClientsOnlineList(socket?.id);
      removeFromAdminsOnlineList(socket?.id);
      io.emit("getAdminsAndClientsOnlineList", adminsAndClientsOnlineList);
      io.emit("getAdminsOnlineList", adminsOnlineList);
    });
  });
};

export { initSocketIO };
