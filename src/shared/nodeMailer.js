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
  host: "churchlogo.co",
  port: 587,
  secure: false,
  auth: {
    user: config.support_mail_address,
    pass: config.nodemailer_pass,
  },
  tls: {
    rejectUnauthorized: false,
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
        from: config.support_mail_address,
        to: config.support_mail_address,
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

export const sendOrderInvoiceToCustomer = async (invoice, email, logo) => {
  const templatePath = path.join(__dirname, "../views/orderInvoice.ejs");
  const newInvoice = {
    ...invoice,
    logo,
  };

  ejs.renderFile(templatePath, newInvoice, async (err, template) => {
    if (err) {
      console.log(err);
    } else {
      const mailOptions = {
        from: `"ChurchLogo" <${config.invoice_mail_address}>`,
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

export const sendEmailVerificationLink = async (email, name, token) => {
  const mailOptions = {
    from: `"ChurchLogo" <${config.support_mail_address}>`,
    to: email,
    subject: "Email Verification",
    html: `<div style="width: 100%; padding: 20px; font-size: 16px; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h3>Dear, ${name}</h3>
  <p>
    Thank you for joining Church Logo! To complete your registration and activate your account, 
    please verify your email address by clicking the link below <strong style="font-weight: 700;">within 15 minutes</strong>:
  </p>

  <p style="margin: 30px 0;">
    <a 
      href="${config.frontend_base_url}/verify-email/${token}" 
      target="_blank" 
      style="
        padding: 12px 24px;
        background-color: #348edb;
        color: #ffffff;
        text-decoration: none;
        font-weight: bold;
        border-radius: 5px;
        display: inline-block;
      "
    >
      Verify Email Address
    </a>
  </p>

  <p>
    Verifying your email ensures you have uninterrupted access to your account and our exclusive member features.
  </p>

  <p>
    If you encounter any issues or have questions, please don't hesitate to contact us at 
    <a href="mailto:${config.support_mail_address}" style="color: #348edb; text-decoration: none;">${config.support_mail_address}</a>
  </p>

  <p>
    We’re glad to have you on board and look forward to serving you.
  </p>

  <p style="margin: 40px 0 0;">
    Warm regards, <br />
    <strong>The Church Logo Support Team</strong>
  </p>

  <footer style="margin-top: 40px; font-size: 14px; color: #777;">
    <a 
      href="${config.frontend_base_url}" 
      target="_blank" 
      style="color: #348edb; text-decoration: none; font-weight: bold;"
    >
      www.churchlogo.co
    </a>
  </footer>
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

export const sendForgotPasswordLink = async (email, name, token) => {
  const mailOptions = {
    from: `"ChurchLogo" <${config.support_mail_address}>`,
    to: email,
    subject: "Reset Your Church Logo Password",
    html: `
      <div style="width: 100%; padding: 20px 10px; font-size: 18px; font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h3>Hello, ${name}</h3>

        <p>
          We received a request to reset your Church Logo account password. Please click the link below 
          <strong style="font-weight: 900;">within 15 minutes</strong> to reset your password:
        </p>

        <p style="margin: 30px 0;">
          <a 
            href="${config.frontend_base_url}/reset-password/${token}" 
            target="_blank" 
            style="
              padding: 12px 24px;
              background-color: #348edb;
              color: #ffffff;
              text-decoration: none;
              font-weight: bold;
              border-radius: 5px;
            "
          >
            Reset Your Password
          </a>
        </p>

        <p>
          If you didn’t request this password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>

        <p>
          Once your password is reset, you’ll be signed in and can access the member-only area.
        </p>

        <p style="margin: 40px 0 0;">
          Best regards, <br />
          <strong>The Church Logo Support Team</strong>
        </p>

        <footer style="margin-top: 40px; font-size: 14px; color: #777;">
            <p style="margin: 0;">For further assistance, contact us at:</p>
            <a 
              href="mailto:${config.contact_mail_address}" 
              target="_blank" 
              style="color: #348edb; text-decoration: none; font-weight: bold;"
            >
              ${config.contact_mail_address}
            </a>
            <p style="margin: 10px 0 0;">
              <a 
                href="${config.frontend_base_url}" 
                target="_blank" 
                style="color: #348edb; text-decoration: none;"
              >
                www.churchlogo.co
              </a>
            </p>
        </footer>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to send reset password email"
    );
  }
};

export const sendAdminForgotPasswordLink = async (email, name, token) => {
  const mailOptions = {
    from: `"ChurchLogo" <${config.support_mail_address}>`,
    to: email,
    subject: "Reset Your Admin Password - Church Logo Dashboard",
    html: `
      <div style="width: 100%; padding: 20px; font-size: 16px; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h3>Dear, ${name}</h3>
        <p>
          We received a request to reset your password for the Church Logo Admin Dashboard.
          If you made this request, please click the link below <strong>within 24 hours</strong> to reset your password securely:
        </p>

        <p style="margin: 30px 0;">
          <a
            href="${config.admin_frontend_base_url}/reset-password/${token}"
            target="_blank"
            style="
              padding: 12px 24px;
              background-color: #348edb;
              color: #ffffff;
              text-decoration: none;
              font-weight: bold;
              border-radius: 5px;
              display: inline-block;
            "
          >
            Reset Your Password
          </a>
        </p>

        <p>
          If you did not make this request, please contact support immediately. For security purposes, this link will expire after 15 minutes.
        </p>
        <p>Once your password is reset, you will be signed in and able to access the Admin Dashboard.</p>

        <p>Warm regards,</p>
        <p><strong>The Church Logo Support Team</strong></p>

        <footer style="margin-top: 40px; font-size: 14px; color: #777;">
          <a
            href="${config.admin_frontend_base_url}"
            target="_blank"
            style="color: #348edb; text-decoration: none; font-weight: bold;"
          >
            www.admin.churchlogo.co
          </a>
        </footer>
      </div>
    `,
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

export const getNotifiedNewRegistration = async (newUser, adminEmail) => {
  const mailOptions = {
    from: `"ChurchLogo" <${config.support_mail_address}>`,
    to: adminEmail,
    subject: "New Registration",
    html: `
      <div style="width: 100%; padding: 20px; font-size: 16px; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h3>Customer Information</h3>
        <p>User ID: ${newUser.userId}</p>
        <p>Name: ${newUser.firstName} ${newUser.lastName}</p>
        <p>Email: ${newUser.email}</p>
        <p>Google sign-up: ${newUser.isGoogleLogin ? "Yes" : "No"}</p>
      </div>
    `,
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

export const welcomeMessage = async (newUser) => {
  const mailOptions = {
    from: `"ChurchLogo" <${config.support_mail_address}>`,
    to: newUser.email,
    subject: "Welcome to ChurchLogo - Your Branding Partner!",
    html: `
      <div style="width: 100%; padding: 20px; font-size: 16px; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="text-align: center; color: #4CAF50;">Welcome to ChurchLogo!</h2>
        <p>Dear ${newUser.firstName} ${newUser.lastName},</p>
        <p>We are thrilled to have you as part of the ChurchLogo family! Our mission is to help churches like yours bring their vision to life through exceptional branding and design. Whether you're looking for logos, banners, or other creative assets, we’re here to support you every step of the way.</p>
        
        <h3>Here are your registration details:</h3>
        <p><strong>User ID:</strong> ${newUser.userId}</p>
        <p><strong>Email:</strong> ${newUser.email}</p>
        
        <h3>What’s Next?</h3>
        <p>Feel free to explore our services and resources tailored for your church's unique needs. If you have any questions or need assistance, our support team is here for you.</p>
        
        <h3>Contact Us Anytime</h3>
        <p>Email:
         <a 
            href="mailto:${config.contact_mail_address}" 
            target="_blank" 
            style="color: #348edb; text-decoration: none; font-weight: bold;"
          >
          ${config.contact_mail_address}
          </a>
        </p>
        
        <p style="text-align: center; color: #555;">Thank you for trusting us to be part of your journey. Together, we’ll create something truly meaningful.</p>
        
        <p style="text-align: center; font-size: 14px; color: #777;">With blessings,</p>
        <p style="text-align: center; font-size: 16px; color: #4CAF50;"><strong>The ChurchLogo Team</strong></p>
        
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; text-align: center; color: #888;">If you did not sign up for ChurchLogo, please contact us immediately.</p>
      </div>
    `,
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
