import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { EditTodoDto } from './dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { join } from 'path';
import { unlink } from 'fs/promises';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async getAllPosts(currentUserId?: number) {
    return this.prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            login: true,
            photo: true,
          },
        },
        likes:
          currentUserId !== undefined
            ? { where: { userId: currentUserId } }
            : undefined,
        _count: { select: { likes: true, comments: true } },
        savedPosts:
          currentUserId !== undefined
            ? { where: { userId: currentUserId } }
            : undefined,
      },
    });
  }

  async getPostsByTags(tags: string[], currentUserId: number) {
    return this.prisma.post.findMany({
      where: {
        tag: typeof tags === 'string' ? tags : { in: tags },
      },
      include: {
        user: {
          select: {
            id: true,
            login: true,
            photo: true,
          },
        },
        likes:
          currentUserId !== undefined
            ? { where: { userId: currentUserId } }
            : undefined,
        _count: { select: { likes: true, comments: true } },
        savedPosts:
          currentUserId !== undefined
            ? { where: { id: currentUserId } }
            : undefined,
      },
    });
  }

  getPosts(userId: number) {
    return this.prisma.post.findMany({
      where: { userId: userId },
    });
  }

  getPostById(postId: number, currentUserId: number) {
    return this.prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        user: {
          select: {
            id: true,
            login: true,
            photo: true,
          },
        },
        likes:
          currentUserId !== undefined
            ? { where: { userId: currentUserId } }
            : undefined,
        _count: { select: { likes: true, comments: true } },
        savedPosts:
          currentUserId !== undefined
            ? { where: { id: currentUserId } }
            : undefined,
      },
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

    // check if user owns this post
    if (!post || post.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    await this.prisma.like.deleteMany({
      where: {
        postId: postId,
      },
    });

    // delete the post images
    if (post.pictures && post.pictures.length > 0) {
      for (const picture of post.pictures) {
        const imagePath = join(process.cwd(), 'uploads/post-images', picture);
        try {
          await unlink(imagePath);
        } catch (err) {
          console.error(`Error while deleting image ${imagePath}: ${err}`);
        }
      }
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

  //post saving funcs

  async addToFavorites(userId: number, postId: number) {
    return this.prisma.savedPost.create({
      data: {
        userId: userId,
        postId: postId,
      },
    });
  }

  async removeFromFavorites(userId: number, postId: number) {
    return this.prisma.savedPost.deleteMany({
      where: {
        userId: userId,
        postId: postId,
      },
    });
  }

  //comments section

  async addComment(userId: number, postId: number, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        ...dto,
        userId: userId,
        postId: postId,
      },
    });
  }

  async removeComment(commentId: number) {
    return this.prisma.comment.deleteMany({
      where: {
        id: commentId,
      },
    });
  }

  async getCommentsOfPost(postId: number) {
    return this.prisma.comment.findMany({
      where: {
        postId: postId,
      },
      include: {
        user: {
          select: {
            id: true,
            login: true,
            photo: true,
          },
        },
      },
    });
  }
}
