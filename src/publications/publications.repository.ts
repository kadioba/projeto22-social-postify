import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicationDto } from './dto/create-publication.dto';

@Injectable()
export class PublicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreatePublicationDto) {
    return await this.prisma.publication.create({
      data: body,
    });
  }

  async findAll() {
    return await this.prisma.publication.findMany();
  }

  async findUnique(id: number) {
    return await this.prisma.publication.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, body: CreatePublicationDto) {
    return await this.prisma.publication.update({
      where: {
        id,
      },
      data: body,
    });
  }

  async remove(id: number) {
    return await this.prisma.publication.delete({
      where: {
        id,
      },
    });
  }

  async findByMediaId(id: number) {
    return await this.prisma.publication.findMany({
      where: {
        mediaId: id,
      },
    });
  }

  async findByPostId(id: number) {
    return await this.prisma.publication.findMany({
      where: {
        postId: id,
      },
    });
  }
}
