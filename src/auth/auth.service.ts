import { Injectable } from '@nestjs/common';
import { User, Note } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({})
export class AuthService {
  constructor(private prismaService: PrismaService) {}
  register() {
    return 'service register';
  }
  login() {
    return 'service login';
  }
}
