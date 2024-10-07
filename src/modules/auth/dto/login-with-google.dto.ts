import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class LoginWithGoogleDto {
  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsNotEmpty()
  providerId: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  avatar: string;
}
