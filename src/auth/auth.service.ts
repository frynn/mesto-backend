import { ForbiddenException, Injectable } from '@nestjs/common';
import 'dotenv/config';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { SignInDto, SignUpDto } from '../dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(dto: SignUpDto) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          login: dto.login,
          firstname: dto.firstname,
          secondname: dto.secondname,
          patronymic: dto.patronymic,
          email: dto.email,
          date: dto.date,
          status: dto.status,
          role: dto.role,
          hash,
        },
      });
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signIn(dto: SignInDto) {
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
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      secret: secret,
    });
    return { access_token: token };
  }
}
