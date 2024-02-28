import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import e, { Request } from 'express';
import { CreatePostDto } from './dto/create-post.dto';
import { EditTodoDto } from './dto';
import { JwtGuard } from '../auth/guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from '../utils/file-upload-utils';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Get('all-posts')
  async getAllPosts() {
    return this.postService.getAllPosts();
  }

  @Get('user-posts')
  getPosts(@Req() req: Request) {
    return this.postService.getPosts(req.user.id);
  }

  @Get('posts-by-tag')
  getPostsByTags(@Query('tag') tags: string[]) {
    return this.postService.getPostsByTags(tags);
  }

  @Get(':id')
  getPostById(@Req() req: Request, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.getPostById(req.user.id, postId);
  }

  @Get('/images/:imgpath')
  seeUploadedFile(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: './uploads/post-images' });
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/post-images',
        filename: editFileName,
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      originalname: file.originalname,
      filename: file.filename,
    };
  }

  @UseGuards(JwtGuard)
  @Post()
  createPost(@Req() req: Request, @Body() dto: CreatePostDto) {
    return this.postService.createPost(req.user.id, dto);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  editPost(
    @Req() req: Request,
    @Param('id', ParseIntPipe) postId: number,
    @Body() dto: EditTodoDto,
  ) {
    return this.postService.editPostById(req.user.id, postId, dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deletePost(@Req() req: Request, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.deletePost(req.user.id, postId);
  }
}
