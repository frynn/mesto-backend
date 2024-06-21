import { IsNotEmpty } from 'class-validator';

export class PasswordChangeDto {
  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  newPassword: string;
}
