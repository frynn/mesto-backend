import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  link: string;

  @IsArray()
  pictures: string[];

  @IsString()
  @IsOptional()
  region: string;

  @IsString()
  tag: string;

  date: Date;

  fee: number;
}
