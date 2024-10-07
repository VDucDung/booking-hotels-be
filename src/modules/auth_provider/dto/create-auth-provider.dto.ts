import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAuthProviderDto {
  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsNotEmpty()
  providerId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: number;
}
