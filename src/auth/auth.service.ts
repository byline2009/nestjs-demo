import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, Note } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDTO } from './dto';
import * as argon from 'argon2';
import { IsEmail } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async register(authDTO: AuthDTO) {
    const hashedPassword = await argon.hash(authDTO.password);

    try {
      const user = await this.prismaService.user.create({
        data: {
          email: authDTO.email,
          hashedPassword: hashedPassword,
          firstName: '',
          lastName: '',
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
      return await this.signJwtToken(user.id, user.email);
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ForbiddenException('Email already registered');
      }
      return { error: err };
    }
  }
  async login(authDTO: AuthDTO) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: authDTO.email,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        hashedPassword: true,
      },
    });
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    const passwordMatched = await argon.verify(
      user.hashedPassword,
      authDTO.password,
    );
    if (!passwordMatched) {
      throw new ForbiddenException('Incorrect password');
    }
    delete user.hashedPassword;
    return await this.signJwtToken(user.id, user.email);
  }
  signJwtToken = async (userId: number, email: string) => {
    const payload = {
      sub: userId,
      email,
    };
    const jwtString = await this.jwtService.signAsync(payload, {
      expiresIn: '10m',
      secret: this.configService.get('JWT_SECRET'),
    });
    return { accessToken: jwtString };
  };
}
