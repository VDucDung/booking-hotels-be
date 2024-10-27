import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateReplyDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  reviewId: number;
}
