import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  Matches,
  MaxLength,
  IsDateString,
  IsEnum,
  IsString,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PASSWORD_REGEX, PHONE_VN_REGEX } from 'src/constants';
import { ERole } from 'src/enums/roles.enum';
import { COMMON_MESSAGE } from 'src/messages';

export class UpdateUserDto {
  @IsOptional()
  @MaxLength(30, {
    message: i18nValidationMessage(COMMON_MESSAGE.MAX),
  })
  @IsEmail({}, { message: i18nValidationMessage(COMMON_MESSAGE.INVALID_EMAIL) })
  @ApiProperty({
    name: 'email',
    type: String,
    required: false,
  })
  email?: string;

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

  @IsOptional()
  @MaxLength(30, {
    message: i18nValidationMessage(COMMON_MESSAGE.MAX),
  })
  @ApiProperty({
    name: 'fullname',
    type: String,
    required: false,
  })
  fullname?: string;

  @IsOptional()
  @MaxLength(30, {
    message: i18nValidationMessage(COMMON_MESSAGE.MAX),
  })
  @Matches(PASSWORD_REGEX, {
    message: i18nValidationMessage('user.PASSWORD'),
  })
  @ApiProperty({
    name: 'password',
    type: String,
    required: false,
  })
  password?: string;

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
  @IsEnum(ERole, {
    message: i18nValidationMessage(COMMON_MESSAGE.INVALID),
  })
  @ApiProperty({
    enum: ERole,
    name: 'Role',
    type: String,
    required: false,
  })
  role?: ERole;

  @IsOptional()
  @ApiProperty({
    name: 'avatar',
    type: String,
    required: false,
  })
  avatar?: string;

  @IsOptional()
  @ApiProperty({
    name: 'balance',
    type: Number,
    required: false,
  })
  balance?: number;

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

  @IsOptional()
  @ApiProperty({
    name: 'isVerify',
    type: Boolean,
    required: false,
  })
  isVerify?: boolean;

  @IsOptional()
  @IsDateString(
    {},
    { message: i18nValidationMessage(COMMON_MESSAGE.INVALID_DATE) },
  )
  @ApiProperty({
    name: 'verifyExpireAt',
    type: Date,
    required: false,
  })
  verifyExpireAt?: Date;

  @IsOptional()
  @ApiProperty({
    name: 'forgotStatus',
    type: String,
    required: false,
  })
  forgotStatus?: string;

  @IsOptional()
  @ApiProperty({
    name: 'isLocked',
    type: Boolean,
    required: false,
  })
  isLocked?: boolean;

  @IsOptional()
  @IsDateString(
    {},
    { message: i18nValidationMessage(COMMON_MESSAGE.INVALID_DATE) },
  )
  @ApiProperty({
    name: 'lastActive',
    type: Date,
    required: false,
  })
  lastActive?: Date;

  @IsOptional()
  @IsString()
  stripeAccountId?: string;

  @IsOptional()
  @IsString()
  stripeCustomerId?: string;
}
