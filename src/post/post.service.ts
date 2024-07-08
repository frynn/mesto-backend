import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { EditTodoDto } from './dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class PostService {
  imageUrlPrefix = 'http://localhost:3000/users/images/';
  postUrlPrefix = 'http://localhost:3000/post/images/';
  constructor(private prisma: PrismaService) {}

  async getAllPosts(currentUserId?: number) {
    const posts = await this.prisma.post.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    for (const post of posts) {
      if (post.user.photo) {
        post.user.photo = this.imageUrlPrefix + post.user.photo;
      } else {
        post.user.photo = this.imageUrlPrefix + 'man_avatar.jpg';
      }
    }
    return posts;
  }

  async getPostsByTags(tags: string[], currentUserId: number) {
    const posts = await this.prisma.post.findMany({
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
            ? { where: { userId: currentUserId } }
            : undefined,
      },
    });

    for (const post of posts) {
      if (post.user.photo) {
        post.user.photo = this.imageUrlPrefix + post.user.photo;
      } else {
        post.user.photo = this.imageUrlPrefix + 'man_avatar.jpg';
      }
    }
    return posts;
  }

  getPosts(userId: number) {
    return this.prisma.post.findMany({
      where: { userId: userId },
    });
  }

  async getPostById(postId: number, currentUserId: number) {
    const post = await this.prisma.post.findUnique({
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
            ? { where: { userId: currentUserId } }
            : undefined,
      },
    });

    if (post.user.photo) {
      post.user.photo = this.imageUrlPrefix + post.user.photo;
    } else {
      post.user.photo = this.imageUrlPrefix + 'man_avatar.jpg';
    }

    return post;
  }

  async search(query: string) {
    const results = await this.prisma.post.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            region: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            login: true,
          },
        },
      },
    });

    // Разделение результатов на массивы в зависимости от того, где было найдено совпадение
    const foundInTitle = results.filter((post) =>
      post.title.toLowerCase().includes(query.toLowerCase()),
    );
    for (const item of foundInTitle) {
      if (item.pictures) {
        item.pictures[0] = this.postUrlPrefix + item.pictures[0];
      }
    }
    const foundInRegion = results.filter(
      (post) =>
        post.region.toLowerCase().includes(query.toLowerCase()) &&
        !post.title.toLowerCase().includes(query.toLowerCase()),
    );
    for (const item of foundInRegion) {
      if (item.pictures) {
        item.pictures[0] = this.postUrlPrefix + item.pictures[0];
      }
    }

    return {
      foundInTitle,
      foundInRegion,
    };
  }

  async searchUsersAdmin(query: string) {
    const results = await this.prisma.user.findMany({
      where: {
        login: {
          contains: query,
          mode: 'insensitive',
        },
        NOT: {
          status: 'banned',
          role: 'admin',
        },
      },
      select: {
        id: true,
        login: true,
        photo: true,
        status: true,
        role: true,
      },
    });

    // Разделение результатов на массивы в зависимости от того, где было найдено совпадение
    const foundUsers = results.filter((user) =>
      user.login.toLowerCase().includes(query.toLowerCase()),
    );
    for (const item of results) {
      if (item.photo) {
        item.photo = this.imageUrlPrefix + item.photo;
      } else {
        item.photo = this.imageUrlPrefix + 'man_avatar.jpg';
      }
    }
    return {
      foundUsers,
    };
  }

  async banOfUserByAdmin(userId: number) {
    return this.prisma.user.updateMany({
      where: {
        id: userId,
      },
      data: {
        status: 'banned',
      },
    });
  }

  async unbanOfUserByAdmin(userId: number) {
    return this.prisma.user.updateMany({
      where: {
        id: userId,
      },
      data: {
        status: 'active',
      },
    });
  }

  async getBannedUsers() {
    const bannedUsers = await this.prisma.user.findMany({
      where: {
        status: 'banned',
      },
      select: {
        id: true,
        login: true,
        photo: true,
        status: true,
      },
    });

    for (const bannedUser of bannedUsers) {
      if (bannedUser.photo) {
        bannedUser.photo = this.imageUrlPrefix + bannedUser.photo;
      } else {
        bannedUser.photo = this.imageUrlPrefix + 'man_avatar.jpg';
      }
    }
    return bannedUsers;
  }

  async createPost(userId: number, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async createEvent(userId: number, dto: CreateEventDto) {
    return this.prisma.post.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async editEventById(userId: number, postId: number, dto: CreateEventDto) {
    const event = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    if (!event || event.userId !== userId) {
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

    await this.prisma.savedPost.deleteMany({
      where: { postId: postId },
    });

    await this.prisma.comment.deleteMany({
      where: {
        postId: postId,
      },
    });

    await this.prisma.report.deleteMany({
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

  async getFavoritesPosts(userId: number) {
    const posts = await this.prisma.savedPost.findMany({
      where: {
        userId: userId,
      },
      include: {
        post: true,
        user: {
          select: {
            id: true,
            login: true,
            photo: true,
          },
        },
      },
    });
    for (const post of posts) {
      if (post.user.photo) {
        post.user.photo = this.imageUrlPrefix + post.user.photo;
      } else {
        post.user.photo = this.imageUrlPrefix + 'man_avatar.jpg';
      }
    }
    return posts;
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
    const comments = await this.prisma.comment.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    for (const comment of comments) {
      if (comment.user.photo) {
        comment.user.photo = this.imageUrlPrefix + comment.user.photo;
      } else {
        comment.user.photo = this.imageUrlPrefix + 'man_avatar.jpg';
      }
    }
    return comments;
  }

  async getPostsOfSubscribedUsers(userId: number) {
    // Получаем ID пользователей, на которых подписан текущий пользователь
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        subscriptionId: userId,
      },
      select: {
        subscriberId: true,
      },
    });

    // Извлекаем ID пользователей
    const subscribedUserIds = subscriptions.map((sub) => sub.subscriberId);

    // Получаем посты всех подписанных пользователей
    const posts = await this.prisma.post.findMany({
      where: {
        userId: {
          in: subscribedUserIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            login: true,
            photo: true,
          },
        },
        likes: userId !== undefined ? { where: { userId: userId } } : undefined,
        _count: { select: { likes: true, comments: true } },
        savedPosts:
          userId !== undefined ? { where: { userId: userId } } : undefined,
      },
    });
    for (const post of posts) {
      if (post.user.photo) {
        post.user.photo = this.imageUrlPrefix + post.user.photo;
      } else {
        post.user.photo = this.imageUrlPrefix + 'man_avatar.jpg';
      }
    }
    return posts;
  }

  async getLikedPosts(userId: number) {
    const likedPosts = await this.prisma.like.findMany({
      where: {
        userId: userId,
      },
      include: {
        post: true,
      },
    });

    for (const item of likedPosts) {
      item.post.pictures[0] = this.postUrlPrefix + item.post.pictures[0];
    }
    return likedPosts;
  }

  async createReport(dto: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        description: dto.description,
        postId: dto.postId,
        userId: dto.userId,
      },
    });
  }

  async getReports() {
    const reports = await this.prisma.report.findMany({
      include: {
        post: true,
        user: {
          select: {
            id: true,
            login: true,
            photo: true,
            status: true,
          },
        },
      },
    });
    // Преобразование ссылок на картинки
    const transformedReports = reports.map((report) => {
      if (report.post.pictures) {
        report.post.pictures = report.post.pictures.map(
          (pic) => this.postUrlPrefix + pic,
        );
      }
      if (report.user.photo) {
        report.user.photo = this.imageUrlPrefix + report.user.photo;
      } else {
        report.user.photo = this.imageUrlPrefix + 'man_avatar.jpg';
      }
      return report;
    });

    return transformedReports;
  }

  async deleteReport(id: number) {
    return this.prisma.report.deleteMany({
      where: {
        id: id,
      },
    });
  }
}
