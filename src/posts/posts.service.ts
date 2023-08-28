import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsRepository } from './posts.repository';
import { PublicationsService } from 'src/publications/publications.service';

@Injectable()
export class PostsService {
  constructor(
    @Inject(forwardRef(() => PublicationsService))
    private readonly publicationsService: PublicationsService,
    private readonly postsRepository: PostsRepository,
  ) {}
  async create(body: CreatePostDto) {
    return await this.postsRepository.create(body);
  }

  async findAll() {
    return (await this.postsRepository.findAll()).map((post) => {
      if (!post.image) {
        delete post.image;
      }
      return post;
    });
  }

  async findOne(id: number) {
    const post = await this.postsRepository.findUnique(id);
    if (!post) {
      throw new NotFoundException();
    }
    if (post.image === null) {
      delete post.image;
    }
    return post;
  }

  async update(id: number, body: CreatePostDto) {
    const postExists = await this.postsRepository.findUnique(id);
    if (!postExists) {
      throw new NotFoundException();
    }
    const updatedPost = await this.postsRepository.update(id, body);
    if (updatedPost.image === null) {
      delete updatedPost.image;
    }
    return updatedPost;
  }

  async remove(id: number) {
    const postExists = await this.postsRepository.findUnique(id);
    if (!postExists) {
      throw new NotFoundException();
    }
    const publications = await this.publicationsService.findByPostId(id);
    if (publications.length > 0) {
      throw new ForbiddenException();
    }
    return await this.postsRepository.remove(id);
  }
}
