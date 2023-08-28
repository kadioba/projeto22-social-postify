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

  async findAll() {
    return await this.publicationsRepository.findAll();
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
    if (publication.date < new Date()) {
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
