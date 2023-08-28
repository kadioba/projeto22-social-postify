import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreatePostDto) {
    return await this.prisma.post.create({
      data: body,
    });
  }

  async findAll() {
    return await this.prisma.post.findMany();
  }

  async findUnique(id: number) {
    return await this.prisma.post.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, body: CreatePostDto) {
    return await this.prisma.post.update({
      where: {
        id,
      },
      data: body,
    });
  }

  async remove(id: number) {
    return await this.prisma.post.delete({
      where: {
        id,
      },
    });
  }
}
