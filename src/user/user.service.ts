import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
import * as argon from 'argon2';
import { PasswordChangeDto } from './dto/password-change.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private imageUrlPrefix = 'http://localhost:3000/users/images/';

  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.hash;

    return user;
  }

  async changePassword(userId: number, dto: PasswordChangeDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      console.log('User not found');
      return false;
    }

    const isCurrentPasswordValid = await this.comparePasswords(
      user.hash,
      dto.oldPassword,
    );

    if (!isCurrentPasswordValid) {
      console.log('Current password is incorrect');
      return false;
    }

    const hashedNewPassword = await this.hashPassword(dto.newPassword);

    // Обновите пароль пользователя с новым хешем
    await this.prisma.user.update({
      where: { id: userId },
      data: { hash: hashedNewPassword },
    });

    return true;
  }

  private async hashPassword(password: string): Promise<string> {
    return await argon.hash(password);
  }

  private async comparePasswords(
    hashedPassword: string,
    inputPassword: string,
  ): Promise<boolean> {
    return await argon.verify(hashedPassword, inputPassword);
  }

  async getMyProfile(userId: number) {
    const profile = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        _count: {
          select: { subscriptions: true, subscribers: true, posts: true },
        },
      },
    });
    if (profile.photo !== null) {
      profile.photo = this.imageUrlPrefix + profile.photo;
    } else {
      profile.photo = this.imageUrlPrefix + 'man_avatar.jpg';
    }
    return profile;
  }

  async getUserProfile(userId: number, currentUserId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        login: true,
        firstname: true,
        secondname: true,
        photo: true,
        about: true,
        subscribers:
          currentUserId !== undefined
            ? { where: { subscriptionId: currentUserId } }
            : undefined,
        _count: {
          select: { subscriptions: true, subscribers: true, posts: true },
        },
      },
    });
    if (user.photo !== null) {
      user.photo = this.imageUrlPrefix + user.photo;
    } else {
      user.photo = this.imageUrlPrefix + 'man_avatar.jpg';
    }
    return user;
  }

  //subscriptions
  async subscribe(subscriptionId: number, subscriberId: number) {
    return this.prisma.subscription.create({
      data: {
        subscriptionId: subscriberId,
        subscriberId: subscriptionId,
      },
    });
  }

  async unsubscribe(userId: number, currentUserId: number) {
    return this.prisma.subscription.deleteMany({
      where: {
        subscriptionId: currentUserId,
        subscriberId: userId,
      },
    });
  }

  async getUserNotifications(userId: number) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        subscriptionId: userId,
      },
      include: {
        subscription: true,
      },
    });

    const formattedSubscriptions = subscriptions.map((subscription) => {
      const photo = subscription.subscription.photo
        ? this.imageUrlPrefix + subscription.subscription.photo
        : this.imageUrlPrefix + 'man_avatar.jpg';
      return {
        type: 'subscription',
        message: `${subscription.subscription.login} подписался(-ась) на ваши обновления`,
        photo: photo,
        createdAt: subscription.createdAt,
      };
    });

    const likes = await this.prisma.like.findMany({
      where: {
        post: {
          userId: userId,
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
        post: true,
      },
    });

    const formattedLikes = likes.map((like) => {
      const photo = like.user.photo
        ? this.imageUrlPrefix + like.user.photo
        : this.imageUrlPrefix + 'man_avatar.jpg';
      return {
        type: 'like',
        message: `${like.user.login} лайкнул ваш пост "${like.post.title}"`,
        photo: photo,
        createdAt: like.createdAt,
      };
    });

    const comments = await this.prisma.comment.findMany({
      where: {
        post: {
          userId: userId,
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
        post: true,
      },
    });

    const formattedComments = comments.map((comment) => {
      const photo = comment.user.photo
        ? this.imageUrlPrefix + comment.user.photo
        : this.imageUrlPrefix + 'man_avatar.jpg';
      return {
        type: 'comment',
        message: `${comment.user.login} прокомментировал ваш пост "${comment.post.title}"`,
        photo: photo,
        content: comment.content,
        createdAt: comment.createdAt,
      };
    });
    const notifications = [
      ...formattedSubscriptions,
      ...formattedLikes,
      ...formattedComments,
    ];

    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return notifications;
  }

  async getSubscribers(userId: number) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        subscriptionId: userId,
      },
      include: {
        subscriber: {
          select: {
            id: true,
            login: true,
            photo: true,
          },
        },
      },
    });

    const subscribers = await this.prisma.subscription.findMany({
      where: {
        subscriberId: userId,
      },
      include: {
        subscription: {
          select: {
            id: true,
            login: true,
            photo: true,
          },
        },
      },
    });

    for (const subscriber of subscribers) {
      if (subscriber.subscription.photo !== null) {
        subscriber.subscription.photo =
          this.imageUrlPrefix + subscriber.subscription.photo;
      } else {
        subscriber.subscription.photo = this.imageUrlPrefix + 'man_avatar.jpg';
      }
    }

    for (const subscription of subscriptions) {
      if (subscription.subscriber.photo !== null) {
        subscription.subscriber.photo =
          this.imageUrlPrefix + subscription.subscriber.photo;
      } else {
        subscription.subscriber.photo = this.imageUrlPrefix + 'man_avatar.jpg';
      }
    }

    return { subscribers, subscriptions };
  }

  async getCommentsOfUser(userId: number) {
    const comments = await this.prisma.comment.findMany({
      where: {
        userId: userId,
      },
      include: {
        post: true,
      },
    });
    return comments;
  }
}
