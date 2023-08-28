import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediasRepository } from './medias.repository';
import { PublicationsService } from '../publications/publications.service';

@Injectable()
export class MediasService {
  constructor(
    @Inject(forwardRef(() => PublicationsService))
    private readonly publicationsService: PublicationsService,
    private readonly mediasRepository: MediasRepository,
  ) {}

  async create(body: CreateMediaDto) {
    const mediaExists = await this.mediasRepository.findOne(body);
    if (mediaExists) {
      throw new ConflictException();
    }
    return await this.mediasRepository.create(body);
  }

  async findAll() {
    return await this.mediasRepository.findAll();
  }

  async findOne(id: number) {
    const media = await this.mediasRepository.findUnique(id);
    if (!media) {
      throw new NotFoundException();
    }
    return media;
  }

  async update(id: number, body: CreateMediaDto) {
    const media = await this.mediasRepository.findUnique(id);
    if (!media) {
      throw new NotFoundException();
    }
    const mediaExists = await this.mediasRepository.findOne(body);
    if (mediaExists) {
      throw new ConflictException();
    }
    return await this.mediasRepository.update(id, body);
  }

  async remove(id: number) {
    const mediaExists = await this.mediasRepository.findUnique(id);
    if (!mediaExists) {
      throw new NotFoundException();
    }
    const publications = await this.publicationsService.findByMediaId(id);
    if (publications.length > 0) {
      throw new ForbiddenException();
    }
    return this.mediasRepository.remove(id);
  }
}
