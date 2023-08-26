import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dto/create-publication.dto';

@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Post()
  create(@Body() createPublicationDto: CreatePublicationDto) {
    return this.publicationsService.create(createPublicationDto);
  }

  @Get()
  findAll() {
    return this.publicationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicationsService.findOne(+id);
  }

  @Patch(':id')
  update() {
    return 'Not implemented yet';
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publicationsService.remove(+id);
  }
}
