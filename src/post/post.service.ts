import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { EditTodoDto } from './dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  private readonly likes: Record<number, number> = {};

  async getAllPosts() {
    return this.prisma.post.findMany({
      include: { user: true },
    });
  }

  async getPostsByTags(tags: string[]) {
    return this.prisma.post.findMany({
      where: {
        tag: typeof tags === 'string' ? tags : { in: tags },
      },
      include: { user: true },
    });
  }

  getPosts(userId: number) {
    return this.prisma.post.findMany({
      where: { userId: userId },
    });
  }

  getPostById(postId: number) {
    return this.prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: { user: true },
    });
  }

  async search(query: string) {
    return this.prisma.post.findMany({
      where: {
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        user: {
          select: {
            login: true,
          },
        },
      },
    });
  }

  async createPost(userId: number, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async editPostById(userId: number, postId: number, dto: EditTodoDto) {
    //getting by id todo_
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    // check if user owns this todo_
    if (!post || post.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }
    return this.prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deletePost(userId: number, postId: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    // check if user owns this todo_
    if (!post || post.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }
    await this.prisma.post.delete({
      where: {
        id: postId,
      },
    });
  }

  //like functionality

  likePost(postId: number): string {
    if (!this.likes[postId]) {
      this.likes[postId] = 0;
    }
    this.likes[postId]++;
    return `Пост ${postId} теперь имеет ${this.likes[postId]} лайков`;
  }

  getLikes(postId: number): string {
    if (!this.likes[postId]) {
      return `Пост ${postId} не имеет лайков`;
    }
    return `Пост ${postId} имеет ${this.likes[postId]} лайков`;
  }

  unlikePost(postId: number): string {
    if (!this.likes[postId] || this.likes[postId] === 0) {
      return `Пост ${postId} не имеет лайков`;
    }
    this.likes[postId]--;
    return `Пост ${postId} теперь имеет ${this.likes[postId]} лайков`;
  }
}
