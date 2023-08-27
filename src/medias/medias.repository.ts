import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateMediaDto) {
    return await this.prisma.media.create({
      data: body,
    });
  }

  async findOne(body) {
    return await this.prisma.media.findFirst({
      where: {
        title: body.title,
        username: body.username,
      },
    });
  }

  async findAll() {
    return await this.prisma.media.findMany();
  }

  async findUnique(id: number) {
    return await this.prisma.media.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, body: CreateMediaDto) {
    return await this.prisma.media.update({
      where: {
        id,
      },
      data: body,
    });
  }

  async remove(id: number) {
    return await this.prisma.media.delete({
      where: {
        id,
      },
    });
  }
}
