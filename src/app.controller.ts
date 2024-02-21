import { Controller, Request, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from './auth/guard';

@Controller()
export class AppController {
  @UseGuards(JwtGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
