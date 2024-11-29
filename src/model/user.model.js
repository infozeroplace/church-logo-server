import bcrypt from "bcrypt";
import { Schema, model } from "mongoose";
import mongoosePlugin from "mongoose-aggregate-paginate-v2";
import config from "../config/index.js";
import { departments, roles } from "../constant/members.constants.js";

const UserSchema = Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: [true, "User ID is required"],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid URL format",
      ],
      required: [true, "Email address is required"],
    },
    firstName: {
      type: String,
      trim: true,
      min: [1, "Too small"],
      max: [15, "Too big"],
      required: [true, "First name is required!"],
    },
    lastName: {
      type: String,
      trim: true,
      min: [1, "Too small"],
      max: [15, "Too big"],
      required: [true, "Last name is required!"],
    },
    role: {
      type: String,
      enum: {
        values: roles,
        message: "{VALUE} is not matched",
      },
      default: "user",
    },
    departments: {
      type: String,
      enum: {
        values: departments,
        message: "{VALUE} is not matched",
      },
    },
    isGoogleLogin: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    blockStatus: {
      type: Boolean,
      default: false,
    },
    rank: {
      type: String,
      default: "Silver",
    },
    country: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
      enum: {
        values: ["male", "female"],
        message: "{VALUE} is not matched",
      },
    },
    password: {
      type: String,
      match: [
        /^(?=.*[A-Za-z0-9])(?=.*[^A-Za-z0-9]).{6,}$/,
        "Invalid password format",
      ],
      required: function () {
        return !this.isGoogleLogin; // Only require password for non-Google logins
      },
    },
    resetToken: {
      type: String,
    },
    photo: {
      type: {
        publicId: {
          type: String,
        },
        url: {
          type: String,
          match: [/(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, "Invalid URL format"],
        },
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

UserSchema.plugin(mongoosePlugin);

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.password) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds)
    );
  }
  next();
});

const User = model("User", UserSchema);

export default User;
