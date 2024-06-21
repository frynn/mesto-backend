import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from '../utils/file-upload-utils';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordChangeDto } from './dto/password-change.dto';
import { use } from 'passport';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
  ) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(JwtGuard)
  @Patch('change-password')
  async changePassword(@Req() req: Request, @Body() dto: PasswordChangeDto) {
    console.log(req.user.id);
    return this.userService.changePassword(req.user.id, dto);
  }

  @Patch(':id')
  editUser(@Param('id', ParseIntPipe) id: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(id, dto);
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  async getMyProfile(@Req() req: Request) {
    return this.userService.getMyProfile(req.user.id);
  }

  @UseGuards(JwtGuard)
  @Get('profile/:userId')
  async getUserProfile(
    @Req() req: Request,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.userService.getUserProfile(userId, req.user.id);
  }

  //file upload funcs
  @Get(':userId/avatar')
  async getUserAvatar(
    @Param('userId', ParseIntPipe) userId: number,
    @Res() res,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.photo) {
      res.sendFile(user.photo, { root: './uploads/users-avatars' });
    } else {
      res.sendFile('man_avatar.jpg', { root: './assets' });
    }
  }

  @Get('/images/:imgpath')
  seeUploadedFile(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: './uploads/users-avatars' });
  }

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/users-avatars',
        filename: editFileName,
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    const user = await this.prisma.user.update({
      where: { id: request.user.id },
      data: { photo: file.filename },
    });

    return {
      originalname: file.originalname,
      filename: file.filename,
    };
  }

  //subscriptions
  @Post('subscribe/:subscriptionId/:subscriberId')
  async subscribe(
    @Param('subscriptionId', ParseIntPipe) subscriptionId: number,
    @Param('subscriberId', ParseIntPipe) subscriberId: number,
  ) {
    return this.userService.subscribe(subscriptionId, subscriberId);
  }

  @UseGuards(JwtGuard)
  @Delete('unsubscribe/:subscriptionId')
  async unsubscribe(
    @Req() req: Request,
    @Param('subscriptionId', ParseIntPipe) subscriptionId: number,
  ) {
    return this.userService.unsubscribe(subscriptionId, req.user.id);
  }

  @UseGuards(JwtGuard)
  @Get('notifications')
  async getNotifications(@Req() req: Request) {
    return this.userService.getUserNotifications(req.user.id);
  }

  @UseGuards(JwtGuard)
  @Get('subscribers/list/:userId')
  async getSubscribers(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.getSubscribers(userId);
  }

  @UseGuards(JwtGuard)
  @Get('users-comments/:userId')
  async getUserComments(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.getCommentsOfUser(userId);
  }
}
