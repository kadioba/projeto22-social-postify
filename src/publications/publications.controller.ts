import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dto/create-publication.dto';

@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Post()
  create(@Body() body: CreatePublicationDto) {
    return this.publicationsService.create(body);
  }

  @Get()
  findAll(
    @Query('published') published: boolean,
    @Query('after') after: string,
  ) {
    return this.publicationsService.findAll(published, after);
  }

  @Get(':id')
  findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.publicationsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: CreatePublicationDto,
  ) {
    return this.publicationsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.publicationsService.remove(id);
  }
}
