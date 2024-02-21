import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }

  @Patch(':id')
  editUser(@Param('id', ParseIntPipe) id: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(id, dto);
  }
}
