import ejs from "ejs";
import httpStatus from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config/index.js";
import ApiError from "../error/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  service: "gmail",
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: config.support_mail_address,
    pass: config.nodemailer_pass,
  },
});

export const sendOrderDetailsToAdmin = async (order) => {
  const templatePath = path.join(__dirname, "../views/orderDetails.ejs");
  const newOrder = {
    ...order.toObject(),
  };

  ejs.renderFile(templatePath, newOrder, async (err, template) => {
    if (err) {
      console.log(err);
    } else {
      const mailOptions = {
        from: "churchlogo.info@gmail.com",
        to: "churchlogo.info@gmail.com",
        subject: "Order Details",
        html: template,
      };
      try {
        const info = await transporter.sendMail(mailOptions);
        return info;
      } catch (error) {
        throw new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Internal Server Error"
        );
      }
    }
  });
};

export const sendOrderInvoiceToCustomer = async (invoice, email) => {
  const templatePath = path.join(__dirname, "../views/orderInvoice.ejs");
  const newInvoice = {
    ...invoice,
  };

  ejs.renderFile(templatePath, newInvoice, async (err, template) => {
    if (err) {
      console.log(err);
    } else {
      const mailOptions = {
        from: "churchlogo.info@gmail.com",
        to: email,
        subject: "Invoice",
        html: template,
      };
      try {
        const info = await transporter.sendMail(mailOptions);
        return info;
      } catch (error) {
        throw new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Internal Server Error"
        );
      }
    }
  });
};

export const sendEmailVerificationLink = async (email, token) => {
  const mailOptions = {
    from: "churchlogo.info@gmail.com",
    to: email,
    subject: "Email Verification",
    html: `<div style="width: 100%; padding: 20px 10px; font-size: 18px; font-weight: 400">
        <div style="width: 100%">
        <h3>Hello, ${email}:</h3>

        <p style="width: 100%; margin: 30px 0px">
          Please click on the link below <span  style="font-weight: 900">within 24 hours</span> to verify your Church Logo account.
        </p>

        <p style="width: 100%">
            <a
              target="_blank"
              href="${config.frontend_base_url}/verify-email/${token}"
              style="
                padding: 12px 8px;
                background-color: #348edb;
                color: #ffff;
                cursor: pointer;
                text-decoration: none;
              "
              >Verify Email Address</a
            >
        </p>

        <p style="width: 100%; margin: 30px 0px">
          After clicking you will be redirected to a verification screen.
        </p>
        </div>
        
        <p>Good Day,</p>

        <div style="margin: 30px 0px">
        <p>The Church Logo Support Team</p>
        <a target="_blank" href=${config.frontend_base_url}>${config.frontend_base_url}</a>
        </div>
      </div>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};

export const sendForgotPasswordLink = async (email, token) => {
  const mailOptions = {
    from: "churchlogo.info@gmail.com",
    to: email,
    subject: "Forgot password",
    html: `<div style="width: 100%; padding: 20px 10px; font-size: 18px; font-weight: 400">
        <div style="width: 100%">
        <h3>Hello, ${email}:</h3>

        <p style="width: 100%; margin: 30px 0px">
          Please click on the link below <span  style="font-weight: 900">within 24 hours</span> to reset your Church Logo password
        </p>

        <p style="width: 100%">
            <a
              target="_blank"
              href="${config.frontend_base_url}/reset-password/${token}"
              style="
                padding: 12px 8px;
                background-color: #348edb;
                color: #ffff;
                cursor: pointer;
                text-decoration: none;
              "
              >Reset your Password</a
            >
        </p>

        <p style="width: 100%; margin: 30px 0px">
          Once you reset your password, you will be signed in and able to enter the member-only area you tried to access.
        </p>
        </div>

        <div style="margin: 30px 0px">
        <p>The Church Logo Support Team</p>
        <a target="_blank" href=${config.frontend_base_url}>${config.frontend_base_url}</a>
        </div>
      </div>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};

export const sendAdminForgotPasswordLink = async (email, token) => {
  const mailOptions = {
    from: "churchlogo.info@gmail.com",
    to: email,
    subject: "Forgot password",
    html: `<div style="width: 100%; padding: 20px 10px; font-size: 18px; font-weight: 400">
        <div style="width: 100%">
        <h3>Hello, ${email}:</h3>

        <p style="width: 100%; margin: 30px 0px">
          Please click on the link below <span  style="font-weight: 900">within 24 hours</span> to reset your Church Logo password
        </p>

        <p style="width: 100%">
            <a
              target="_blank"
              href="${config.admin_frontend_base_url}/reset-password/${token}"
              style="
                padding: 12px 8px;
                background-color: #348edb;
                color: #ffff;
                cursor: pointer;
                text-decoration: none;
              "
              >Reset your Password</a
            >
        </p>

        <p style="width: 100%; margin: 30px 0px">
          Once you reset your password, you will be signed in and able to enter the member-only area you tried to access.
        </p>
        </div>

        <div style="margin: 30px 0px">
        <p>The Church Logo Support Team</p>
        <a target="_blank" href=${config.admin_frontend_base_url}>${config.admin_frontend_base_url}</a>
        </div>
      </div>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};
