import httpStatus from "http-status";
import config from "../../config/index.js";
import { AuthService } from "../../service/public/auth.services.js";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";

const adminLogout = catchAsync(async (req, res) => {
  const { token } = req.body;
  const { auth } = req.cookies;

  if (!auth) {
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "No session found, but logged out successfully!",
      meta: null,
      data: null,
    });
  }

  res.clearCookie("auth", {
    domain: config.cookie_domain,
    path: "/",
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully!",
    meta: null,
    data: null,
  });
});

const logout = catchAsync(async (req, res) => {
  const { token } = req.body;
  const { auth_refresh } = req.cookies;

  if (!auth_refresh) {
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "No session found, but logged out successfully!",
      meta: null,
      data: null,
    });
  }

  res.clearCookie("auth_refresh", {
    domain: config.cookie_domain,
    path: "/",
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully!",
    meta: null,
    data: null,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { ...resetPasswordData } = req.body;

  const result = await AuthService.resetPassword(resetPasswordData);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successful!",
    meta: null,
    data: result,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { ...forgotPasswordData } = req.body;

  await AuthService.forgotPassword(forgotPasswordData);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "An email has been sent!",
    meta: null,
    data: null,
  });
});

const register = catchAsync(async (req, res) => {
  const { ...registerData } = req.body;

  const { refreshToken, ...data } = await AuthService.register(registerData);

  res.cookie("auth_refresh", refreshToken, {
    domain: config.cookie_domain,
    path: "/",
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Registration successful!",
    meta: null,
    data,
  });
});

const login = catchAsync(async (req, res) => {
  const { ...loginData } = req.body;

  const { refreshToken, ...data } = await AuthService.login(loginData);

  res.cookie("auth_refresh", refreshToken, {
    domain: config.cookie_domain,
    path: "/",
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful!",
    meta: null,
    data,
  });
});

const adminLogin = catchAsync(async (req, res) => {
  const { ...loginData } = req.body;

  const result = await AuthService.adminLogin(loginData);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful!",
    meta: null,
    data: result,
  });
});

const googleLogin = catchAsync(async (req, res) => {
  const { code } = req.body;

  const { refreshToken, ...data } = await AuthService.googleLogin(code);

  res.cookie("auth_refresh", refreshToken, {
    domain: config.cookie_domain,
    path: "/",
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful!",
    meta: null,
    data,
  });
});

const adminRefreshToken = catchAsync(async (req, res) => {
  const { auth } = req.cookies;

  const result = await AuthService.adminRefreshToken(auth, res);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Refresh token successfully!",
    meta: null,
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { auth_refresh } = req.cookies;

  const result = await AuthService.refreshToken(auth_refresh, res);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Refresh token successfully!",
    meta: null,
    data: result,
  });
});

export const AuthController = {
  adminLogout,
  logout,
  resetPassword,
  forgotPassword,
  register,
  login,
  adminLogin,
  googleLogin,
  adminRefreshToken,
  refreshToken,
};
