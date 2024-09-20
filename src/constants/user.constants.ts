import * as dotenv from 'dotenv';
dotenv.config();

export const ADMIN = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  fullname: process.env.ADMIN_FULLNAME,
};
