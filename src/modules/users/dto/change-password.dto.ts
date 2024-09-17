import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PASSWORD_REGEX } from 'src/constants';
import { COMMON_MESSAGE } from 'src/messages';

export class ChangePasswordDto {
  @Matches(PASSWORD_REGEX, {
    message: i18nValidationMessage('users.INVALID_PASSWORD'),
  })
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  @IsOptional()
  @ApiProperty({
    name: 'oldPassword',
    type: String,
    required: true,
  })
  oldPassword: string;

  @Matches(PASSWORD_REGEX, {
    message: i18nValidationMessage('users.INVALID_PASSWORD'),
  })
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  @IsOptional()
  @ApiProperty({
    name: 'newPassword',
    type: String,
    required: true,
  })
  newPassword: string;
}
