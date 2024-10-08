import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class VerifyOTPForgotPasswordDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
