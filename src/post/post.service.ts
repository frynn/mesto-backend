import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { EditTodoDto } from './dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async getAllPosts(currentUserId?: number) {
    return this.prisma.post.findMany({
      include: {
        user: true,
        likes:
          currentUserId !== undefined
            ? { where: { userId: currentUserId } }
            : undefined,
        _count: { select: { likes: true } },
      },
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

  async addLike(userId: number, postId: number) {
    return this.prisma.like.create({
      data: {
        userId: userId,
        postId: postId,
      },
    });
  }

  async removeLike(userId: number, postId: number) {
    return this.prisma.like.deleteMany({
      where: {
        userId: userId,
        postId: postId,
      },
    });
  }

  async countLikes(postId: number) {
    return this.prisma.like.count({
      where: {
        postId: postId,
      },
    });
  }

  async didUserLikedPost(userId: number, postId: number) {
    const like = await this.prisma.like.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    return like !== null;
  }
}
