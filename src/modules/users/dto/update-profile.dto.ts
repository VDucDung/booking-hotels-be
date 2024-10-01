import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PASSWORD_REGEX, PHONE_VN_REGEX } from 'src/constants';
import { COMMON_MESSAGE } from 'src/messages';

export class UpdateProfileDto {
  @Matches(PHONE_VN_REGEX, {
    message: i18nValidationMessage(COMMON_MESSAGE.INVALID_PHONE),
  })
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  @IsOptional()
  @ApiProperty({
    name: 'phone',
    type: String,
    required: false,
  })
  phone: string;

  @Matches(PASSWORD_REGEX, {
    message: i18nValidationMessage('users.PASSWORD'),
  })
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  @IsOptional()
  @ApiProperty({
    name: 'password',
    type: String,
    required: false,
  })
  password: string;

  @MaxLength(30, {
    message: i18nValidationMessage(COMMON_MESSAGE.MAX),
  })
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  @IsOptional()
  @ApiProperty({
    name: 'username',
    type: String,
    required: false,
  })
  username: string;

  @MaxLength(30, {
    message: i18nValidationMessage(COMMON_MESSAGE.MAX),
  })
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  @IsOptional()
  @ApiProperty({
    name: 'fullname',
    type: String,
    required: false,
  })
  fullname: string;

  @IsInt()
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  @IsOptional()
  @ApiProperty({
    name: 'avatar',
    type: String,
    required: false,
  })
  avatar: string;

  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  @IsOptional()
  @ApiProperty({
    name: 'dateOfBirth',
    type: Date,
    required: false,
  })
  dateOfBirth: Date;
}
