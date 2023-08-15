import { ForbiddenException, Injectable } from '@nestjs/common';
import 'dotenv/config';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { AuthDto } from '../dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          email: dto.email,
          hash,
        },
      });
      delete user.hash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    //find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    //if user doesn't exist - throw exception
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }
    //compare pass
    const pwMatches = await argon.verify(user.hash, dto.password);
    //if pass incorrect
    if (!pwMatches) {
      throw new ForbiddenException('Password is incorrect');
    }
    delete user.hash;
    return user;
  }
}
