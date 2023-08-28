import { Module, forwardRef } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MediasModule } from '../medias/medias.module';
import { PostsModule } from '../posts/posts.module';
import { PublicationsRepository } from './publications.repository';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => MediasModule),
    forwardRef(() => PostsModule),
  ],
  controllers: [PublicationsController],
  providers: [PublicationsService, PublicationsRepository],
  exports: [PublicationsService],
})
export class PublicationsModule {}
