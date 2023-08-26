import { IsDate, IsNotEmpty } from 'class-validator';

export class CreatePublicationDto {
  @IsNotEmpty()
  mediaId: number;

  @IsNotEmpty()
  postId: number;

  @IsDate()
  @IsNotEmpty()
  date: Date;
}
