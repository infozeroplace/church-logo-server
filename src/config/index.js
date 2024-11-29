import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  env: process.env.NODE_ENV,
  port:
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_PORT
      : process.env.DEVELOPMENT_PORT,

  database_url:
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_DATABASE_URL
      : process.env.DEVELOPMENT_DATABASE_URL,

  frontend_base_url:
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_FRONTEND_BASE_URL
      : process.env.DEVELOPMENT_FRONTEND_BASE_URL_DEV,

  admin_frontend_base_url:
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_ADMIN_FRONTEND_BASE_URL
      : process.env.DEVELOPMENT_ADMIN_FRONTEND_BASE_URL_DEV,

  origins:
    process.env.NODE_ENV === "production"
      ? [
          process.env.PRODUCTION_FRONTEND_BASE_URL,
          process.env.PRODUCTION_ADMIN_FRONTEND_BASE_URL,
          process.env.PRODUCTION_FRONTEND_BASE_URL_WWW,
          process.env.PRODUCTION_ADMIN_FRONTEND_BASE_URL_WWW,
        ]
      : [
          process.env.DEVELOPMENT_FRONTEND_BASE_URL_DEV,
          process.env.DEVELOPMENT_ADMIN_FRONTEND_BASE_URL_DEV,
        ],

  stripe_secret_key:
    process.env.NODE_ENV === "production"
      ? process.env.STRIPE_SECRET_KEY_PROD
      : process.env.STRIPE_SECRET_KEY_DEV,

  stripe_publishable_key:
    process.env.NODE_ENV === "production"
      ? process.env.STRIPE_PUBLISHABLE_KEY_PROD
      : process.env.STRIPE_PUBLISHABLE_KEY_DEV,

  stripe_endpoint_secret_key:
    process.env.NODE_ENV === "production"
      ? process.env.STRIPE_ENDPOINT_SECRET_KEY_PROD
      : process.env.STRIPE_ENDPOINT_SECRET_KEY_DEV,

  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,

  jwt: {
    secret: process.env.JWT_SECRET,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
    refresh_expires_in: process.env.JWT_SECRET_EXPIRES_IN,
    email_expires_in: process.env.JWT_EMAIL_EXPIRES_IN,
  },

  refresh_token_name: process.env.REFRESH_TOKEN_NAME,
  refresh_token_domain: process.env.REFRESH_TOKEN_DOMAIN,

  info_mail_address: process.env.INFO_MAIL_ADDRESS,
  support_mail_address: process.env.SUPPORT_MAIL_ADDRESS,
  invoice_mail_address: process.env.INVOICE_MAIL_ADDRESS,
  contact_mail_address: process.env.CONTACT_MAIL_ADDRESS,
  payment_mail_address: process.env.PAYMENT_MAIL_ADDRESS,
  service_mail_address: process.env.SERVICE_MAIL_ADDRESS,
  nodemailer_pass: process.env.NODEMAILER_PASS,

  google_client_id: process.env.GOOGLE_CLIENT_ID,
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET,

  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,

  default_admin_pass: process.env.DEFAULT_ADMIN_PASS,

  super_admin_role: process.env.SUPER_ADMIN_ROLE,
};

export default config;
