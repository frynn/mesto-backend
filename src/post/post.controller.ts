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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Request as NestRequest,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { EditTodoDto } from './dto';
import { JwtGuard } from '../auth/guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from '../utils/file-upload-utils';
import { OptionalJwtGuard } from '../auth/guard/optional-jwt.guard';
import { Request } from 'express';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(OptionalJwtGuard)
  @Get('all-posts')
  async getAllPosts(@NestRequest() req) {
    return this.postService.getAllPosts(req?.user?.id);
  }

  // @UseGuards(JwtGuard)
  @Get('search')
  async search(@Query('query') query: string) {
    return this.postService.search(query);
  }

  @Get('user-posts/:userId')
  getPosts(@Param('userId', ParseIntPipe) userId: number) {
    return this.postService.getPosts(userId);
  }

  @Get('posts-by-tag')
  getPostsByTags(@NestRequest() req, @Query('tag') tags: string[]) {
    return this.postService.getPostsByTags(tags, req?.user?.id);
  }

  @UseGuards(JwtGuard)
  @Post('likes/add/:userId/:postId')
  async addLike(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.postService.addLike(userId, postId);
  }

  @UseGuards(JwtGuard)
  @Delete('likes/remove/:userId/:postId')
  async removeLike(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.postService.removeLike(userId, postId);
  }

  @UseGuards(JwtGuard)
  @Get('likes/get/:postId')
  async countLikes(@Param('postId', ParseIntPipe) postId: number) {
    return this.postService.countLikes(postId);
  }

  @UseGuards(JwtGuard)
  @Post('favorites/add/:userId/:postId')
  async addToFavorites(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.postService.addToFavorites(userId, postId);
  }

  @UseGuards(JwtGuard)
  @Delete('favorites/remove/:userId/:postId')
  async removeFromFavorites(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.postService.removeFromFavorites(userId, postId);
  }

  // @UseGuards(JwtGuard)
  @Get('favorites/get/:userId')
  async getSavedPosts(@Param('userId', ParseIntPipe) userId: number) {
    return this.postService.getFavoritesPosts(userId);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  getPostById(@NestRequest() req, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.getPostById(postId, req?.user?.id);
  }

  @UseGuards(JwtGuard)
  @Get('/images/:imgpath')
  seeUploadedFile(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: './uploads/post-images' });
  }

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads/post-images',
        filename: editFileName,
      }),
    }),
  )
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const filenames = files.map((file) => file.filename);
    return {
      originalnames: files.map((file) => file.originalname),
      filenames,
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

  //comments
  @UseGuards(JwtGuard)
  @Get('comments/get/:postId')
  getComments(@Param('postId', ParseIntPipe) postId: number) {
    return this.postService.getCommentsOfPost(postId);
  }

  @UseGuards(JwtGuard)
  @Post('comment/add')
  addComment(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postService.addComment(userId, postId, dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('comment/remove/:id')
  deleteComment(@Param('id', ParseIntPipe) id: number) {
    return this.postService.removeComment(id);
  }
}
