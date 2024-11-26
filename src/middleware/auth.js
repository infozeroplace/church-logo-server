import httpStatus from "http-status";
import config from "../config/index.js";
import ApiError from "../error/ApiError.js";
import { jwtHelpers } from "../helper/jwtHelpers.js";
import User from "../model/user.model.js";

const auth =
  (...requiredRoles) =>
  async (req, res, next) => {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "UNAUTHORIZED!");
      }

      let verifiedUser = null;

      try {
        verifiedUser = jwtHelpers.verifiedToken(token, config?.jwt?.secret);
      } catch (error) {
        throw new ApiError(httpStatus.FORBIDDEN, "FORBIDDEN!");
      }

      const user = await User.findOne({ userId: verifiedUser.userId });

      if (user && user.role === "user" && user.blockStatus) {
        throw new ApiError(httpStatus.FORBIDDEN, "You've been blocked!");
      }

      req.user = {
        role: user.role,
        userId: user.userId,
        email: user.email,
        blockStatus: user.blockStatus,
        iat: verifiedUser.iat,
        exp: verifiedUser.exp,
      };

      // guard of role
      if (requiredRoles.length && !requiredRoles.includes(user.role)) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "UNAUTHORIZED ACCESS!");
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
