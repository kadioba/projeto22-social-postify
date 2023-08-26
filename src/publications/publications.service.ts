import { Injectable } from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';

@Injectable()
export class PublicationsService {
  create(createPublicationDto: CreatePublicationDto) {
    return 'This action adds a new publication';
  }

  findAll() {
    return `This action returns all publications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} publication`;
  }

  update() {
    return 'Not implemented yet';
  }

  remove(id: number) {
    return `This action removes a #${id} publication`;
  }
}
