import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthProviderDto } from './create-auth-provider.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateAuthProviderDto extends PartialType(CreateAuthProviderDto) {
  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsUUID()
  userId?: number;
}
