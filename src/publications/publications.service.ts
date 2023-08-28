import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { PublicationsRepository } from './publications.repository';
import { MediasService } from '../medias/medias.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class PublicationsService {
  constructor(
    private readonly publicationsRepository: PublicationsRepository,
    private readonly mediasService: MediasService,
    private readonly postService: PostsService,
  ) {}

  async create(body: CreatePublicationDto) {
    await this.mediasService.findOne(body.mediaId);
    await this.postService.findOne(body.postId);
    return await this.publicationsRepository.create(body);
  }

  async findAll(published?: boolean, after?: string) {
    const publications = await this.publicationsRepository.findAll();
    if (published) {
      return publications.filter(
        (publication) => new Date(publication.date) < new Date(),
      );
    }
    if (after) {
      return publications.filter(
        (publication) => new Date(publication.date) > new Date(after),
      );
    }
    return publications;
  }

  async findOne(id: number) {
    const publication = await this.publicationsRepository.findUnique(id);
    if (!publication) {
      throw new NotFoundException();
    }
    return publication;
  }

  async update(id: number, body: CreatePublicationDto) {
    const publication = await this.publicationsRepository.findUnique(id);
    if (!publication) {
      throw new NotFoundException();
    }
    if (new Date(publication.date) < new Date()) {
      throw new ForbiddenException();
    }
    await this.mediasService.findOne(body.mediaId);
    await this.postService.findOne(body.postId);
    return await this.publicationsRepository.update(id, body);
  }

  async remove(id: number) {
    const publication = await this.publicationsRepository.findUnique(id);
    if (!publication) {
      throw new NotFoundException();
    }
    return await this.publicationsRepository.remove(id);
  }
}
