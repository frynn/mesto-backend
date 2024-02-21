import { IsOptional, IsString } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  link: string;

  @IsString()
  picture: string;
}
