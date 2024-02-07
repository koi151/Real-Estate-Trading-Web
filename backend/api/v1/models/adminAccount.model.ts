import mongoose from 'mongoose';
import { statusValues } from '../../../commonTypes';
import { generateRandomString } from '../../../helpers/generateString';

const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const adminAccountSchema = new mongoose.Schema(
  {
    fullName: String,
    password: String,
    email: String,
    token: {
      type: String,
      default: generateRandomString(30)
    },
    role_id: String,
    phone: String,
    avatar: String,
    status: {
      type: String,
      enum: statusValues
    },    
    createdAt: Date,
    expireAt: Date,
    slug: {
      type: String, 
      slug: "title",
      unique: true 
    },
    deleted: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true,
  }
);

const AdminAccount = mongoose.model("AdminAccount", adminAccountSchema, "admin-accounts");

export default AdminAccount;