import * as dotenv from 'dotenv';
dotenv.config();

export const ROLES = 'roles';

export const PERMISSIONS = 'permissions';

export const SALT_ROUNDS = 7;

export const HASH_KEY_AES = process.env.HASH_KEY_AES;

export const nodeEnv = process.env.NODE_ENV;

export const FULLNAME_DEFAULT = 'user';

export const URL_HOST = {
  production_be: process.env.HOST_PRODUCTION_BE,
  production_fe: process.env.HOST_PRODUCTION_FE,
  development: process.env.HOST_DEVELOPMENT,
};

export const SECRET = {
  tokenVerify: process.env.SECRET_TOKEN_VERIFY,
  tokenForgot: process.env.SECRET_TOKEN_FORGOT,
  tokenVerifyOTP: process.env.SECRET_TOKEN_VERIFY_OTP,
};

export const JWT = {
  secretAccess: process.env.JWT_SECRET_ACCESS,
  expiresAccessToken: process.env.JWT_EXPIRES_ACCESS_MINUTES + 'm',
  secretRefresh: process.env.JWT_SECRET_REFRESH,
  expiresRefreshToken: process.env.JWT_EXPIRES_REFRESH_MINUTES + 'm',
  secretVerify: process.env.JWT_SECRET_VERIFY,
  expiresVerify: process.env.JWT_EXPIRES_VERIFY_MINUTES + 'm',
};

export const tokenMappings = {
  access: {
    secret: JWT.secretAccess,
    expiresIn: JWT.expiresAccessToken,
  },
  refresh: {
    secret: JWT.secretRefresh,
    expiresIn: JWT.expiresRefreshToken,
  },
  verify: {
    secret: JWT.secretVerify,
    expiresIn: JWT.expiresVerify,
  },
};

export const TOKEN_TYPES = {
  access: 'access',
  refresh: 'refresh',
  verify: 'verify',
  forgot: 'forgot',
  verify_otp: 'verify_otp',
};

export const EXPIRES_TOKEN_EMAIL_VERIFY = 1000 * 60 * 10;

export const TIME_DIFF_EMAIL_VERIFY = 1000 * 60 * 3;

export const EXPIRES_TOKEN_FOTGOT_PASSWORD = 1000 * 60 * 10;

export const EXPIRES_TOKEN_VERIFY_OTP_FORGOT = 1000 * 60 * 10;

export const LENGTH_OTP_DEFAULT = 6;
