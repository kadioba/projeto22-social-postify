import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePublicationDto {
  @IsNotEmpty()
  @IsNumber()
  mediaId: number;

  @IsNotEmpty()
  @IsNumber()
  postId: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
