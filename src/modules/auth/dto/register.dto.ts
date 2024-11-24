import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  Matches,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PASSWORD_REGEX, PHONE_VN_REGEX } from 'src/constants';
import { COMMON_MESSAGE } from 'src/messages';

export class RegisterDto {
  @MaxLength(30, {
    message: i18nValidationMessage(COMMON_MESSAGE.MAX),
  })
  @IsEmail({}, { message: i18nValidationMessage(COMMON_MESSAGE.INVALID_EMAIL) })
  @ApiProperty({
    name: 'email',
    type: String,
    required: true,
  })
  email: string;

  @IsOptional()
  @MaxLength(30, {
    message: i18nValidationMessage(COMMON_MESSAGE.MAX),
  })
  @ApiProperty({
    name: 'username',
    type: String,
    required: false,
  })
  username?: string;

  @MaxLength(30, {
    message: i18nValidationMessage(COMMON_MESSAGE.MAX),
  })
  @ApiProperty({
    name: 'fullname',
    type: String,
    required: true,
  })
  fullname: string;

  @MaxLength(30, {
    message: i18nValidationMessage(COMMON_MESSAGE.MAX),
  })
  @Matches(PASSWORD_REGEX, {
    message: i18nValidationMessage('user.PASSWORD'),
  })
  @ApiProperty({
    name: 'password',
    type: String,
    required: true,
  })
  password: string;

  @IsOptional()
  @MaxLength(30, {
    message: i18nValidationMessage(COMMON_MESSAGE.MAX),
  })
  @Matches(PHONE_VN_REGEX, {
    message: i18nValidationMessage(COMMON_MESSAGE.INVALID_PHONE),
  })
  @ApiProperty({
    name: 'phone',
    type: String,
    required: false,
  })
  phone?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: i18nValidationMessage(COMMON_MESSAGE.INVALID_DATE) },
  )
  @ApiProperty({
    name: 'dateOfBirth',
    type: Date,
    required: false,
  })
  dateOfBirth?: Date;
}
