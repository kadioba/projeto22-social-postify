import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediasRepository } from './medias.repository';

@Injectable()
export class MediasService {
  constructor(private readonly mediasRepository: MediasRepository) {}

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

  remove(id: number) {
    const mediaExists = this.mediasRepository.findUnique(id);
    if (!mediaExists) {
      throw new NotFoundException();
    }
    // TODO BUSCAR PUBLICATIONS QUE CONTENHAM ESTA MEDIA
    // SE EXISTIREM AS PUBLICATIONS, ERRO 403

    return this.mediasRepository.remove(id);
  }
}
