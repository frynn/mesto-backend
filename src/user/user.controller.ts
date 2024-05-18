import {
  Body,
  Controller,
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

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
  ) {}

  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }

  @Patch(':id')
  editUser(@Param('id', ParseIntPipe) id: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(id, dto);
  }

  @Get(':login')
  async getUserProfile(@Param('login') login: string) {
    return this.userService.getUserProfile(login);
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

    if (!user || !user.photo) {
      throw new NotFoundException('User or avatar not found');
    }
    res.redirect(`/avatars/${user.photo}`);
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
}
