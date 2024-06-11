import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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
    const imageUrlPrefix = 'http://localhost:3000/users/images/';
    if (profile.photo !== null) {
      profile.photo = imageUrlPrefix + profile.photo;
    } else {
      profile.photo = imageUrlPrefix + 'man_avatar.jpg';
    }
    return profile;
  }

  async getUserProfile(userId: number, currentUserId: number) {
    const imageUrlPrefix = 'http://localhost:3000/users/images/';
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
            ? { where: { subscriberId: currentUserId } }
            : undefined,
        _count: {
          select: { subscriptions: true, subscribers: true, posts: true },
        },
      },
    });
    if (user.photo !== null) {
      user.photo = imageUrlPrefix + user.photo;
    } else {
      user.photo = imageUrlPrefix + 'man_avatar.jpg';
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
}
