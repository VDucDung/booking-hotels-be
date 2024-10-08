import { LENGTH_OTP_DEFAULT } from 'src/constants';

export const generateOTP = (length: number = LENGTH_OTP_DEFAULT): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const otp = Math.floor(min + Math.random() * (max - min + 1));
  return otp.toString();
};
