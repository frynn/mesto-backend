import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  login?: string;

  @IsString()
  @IsOptional()
  about?: string;
}
