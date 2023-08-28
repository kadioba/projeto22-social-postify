import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { faker } from '@faker-js/faker';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = await moduleFixture.resolve(PrismaService);
    await prisma.publication.deleteMany();
    await prisma.media.deleteMany();
    await prisma.post.deleteMany();
    await app.init();
  });

  it('GET /health => should get an alive message', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect('I’m okay!');
  });

  it('POST /medias => should return Bad Request when body is invalid', async () => {
    const username = faker.company.name();
    const response = await request(app.getHttpServer())
      .post('/medias')
      .send({ username });

    expect(response.statusCode).toBe(400);
  });

  it('POST /medias => should return Conflict when media already exists', async () => {
    const media = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });
    const response = await request(app.getHttpServer())
      .post('/medias')
      .send({ title: media.title, username: media.username });

    expect(response.statusCode).toBe(409);
  });

  it('POST /medias => should create a media', async () => {
    const title = faker.company.name();
    const username = faker.internet.userName();
    const response = await request(app.getHttpServer())
      .post('/medias')
      .send({ title, username });

    expect(response.statusCode).toBe(201);
  });

  it('GET /medias => should return an empty array if there are no medias', async () => {
    const response = await request(app.getHttpServer()).get('/medias');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('GET /medias => should return all medias', async () => {
    const title = faker.company.name();
    const username = faker.internet.userName();
    await prisma.media.create({
      data: {
        title,
        username,
      },
    });
    const response = await request(app.getHttpServer()).get('/medias');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      {
        id: expect.any(Number),
        title,
        username,
      },
    ]);
  });

  it('GET /medias/:id => should return Not Found if there is no media', async () => {
    const response = await request(app.getHttpServer()).get('/medias/1');

    expect(response.statusCode).toBe(404);
  });

  it('GET /medias/:id => should return a media', async () => {
    const title = faker.company.name();
    const username = faker.internet.userName();
    const media = await prisma.media.create({
      data: {
        title,
        username,
      },
    });
    const response = await request(app.getHttpServer()).get(
      `/medias/${media.id}`,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      id: media.id,
      title,
      username,
    });
  });

  it('PUT /medias/:id => should return Not Found if id does not exist', async () => {
    const response = await request(app.getHttpServer()).put('/medias/2').send({
      title: faker.company.name(),
      username: faker.internet.userName(),
    });

    expect(response.statusCode).toBe(404);
  });

  it('PUT /medias/:id => should return Conflict if media already exists', async () => {
    const media = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });
    const secondMedia = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/medias/${media.id}`)
      .send({ title: secondMedia.title, username: secondMedia.username });

    expect(response.statusCode).toBe(409);
  });

  it('PUT /medias/:id => should update a media', async () => {
    const title = faker.company.name();
    const username = faker.internet.userName();
    const newUsername = faker.internet.userName();
    const media = await prisma.media.create({
      data: {
        title,
        username,
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/medias/${media.id}`)
      .send({ title, username: newUsername });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      id: media.id,
      title,
      username: newUsername,
    });
  });

  it('DELETE /medias/:id => should return Not Found if id does not exist', async () => {
    const response = await request(app.getHttpServer()).delete('/medias/2');

    expect(response.statusCode).toBe(404);
  });

  it('DELETE /medias/:id => should return Forbidden if media is being used', async () => {
    const media = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });
    const post = await prisma.post.create({
      data: {
        title: faker.company.name(),
        text: faker.lorem.paragraph(),
      },
    });
    await prisma.publication.create({
      data: {
        mediaId: media.id,
        postId: post.id,
        date: new Date(),
      },
    });

    const response = await request(app.getHttpServer()).delete(
      `/medias/${media.id}`,
    );

    expect(response.statusCode).toBe(403);
  });

  it('DELETE /medias/:id => should delete a media', async () => {
    const title = faker.company.name();
    const username = faker.internet.userName();
    const media = await prisma.media.create({
      data: {
        title,
        username,
      },
    });

    const response = await request(app.getHttpServer()).delete(
      `/medias/${media.id}`,
    );
    expect(response.statusCode).toBe(200);

    const verifyDelete = await request(app.getHttpServer()).get(
      `/medias/${media.id}`,
    );
    expect(verifyDelete.statusCode).toBe(404);
  });

  it('POST /posts => should return Bad Request when body is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/posts')
      .send({ title: faker.company.name() });

    expect(response.statusCode).toBe(400);
  });

  it('POST /posts => should create a post', async () => {
    const title = faker.company.name();
    const text = faker.lorem.paragraph();
    const image = faker.image.url();

    const response = await request(app.getHttpServer())
      .post('/posts')
      .send({ title, text, image });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(Number),
      title,
      text,
      image,
    });
  });

  it('GET /posts => should return an empty array if there are no posts', async () => {
    const response = await request(app.getHttpServer()).get('/posts');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('GET /posts => should return all posts', async () => {
    const title = faker.company.name();
    const text = faker.lorem.paragraph();
    await prisma.post.create({
      data: {
        title,
        text,
      },
    });

    const response = await request(app.getHttpServer()).get('/posts');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      {
        id: expect.any(Number),
        title,
        text,
      },
    ]);
  });

  it('GET /posts/:id => should return Not Found if there is no post', async () => {
    const response = await request(app.getHttpServer()).get('/posts/1');

    expect(response.statusCode).toBe(404);
  });

  it('GET /posts/:id => should return a post', async () => {
    const title = faker.company.name();
    const text = faker.lorem.paragraph();
    const post = await prisma.post.create({
      data: {
        title,
        text,
      },
    });
    const response = await request(app.getHttpServer()).get(
      `/posts/${post.id}`,
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: post.id,
        title,
        text,
      }),
    );
  });

  it('PUT /posts/:id => should return Not Found if id does not exist', async () => {
    const response = await request(app.getHttpServer()).put('/posts/2').send({
      title: faker.company.name(),
      text: faker.lorem.paragraph(),
    });

    expect(response.statusCode).toBe(404);
  });

  it('PUT /posts/:id => should update a post', async () => {
    const title = faker.company.name();
    const text = faker.lorem.paragraph();
    const newTitle = faker.company.name();
    const newText = faker.lorem.paragraph();
    const post = await prisma.post.create({
      data: {
        title,
        text,
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/posts/${post.id}`)
      .send({ title: newTitle, text: newText });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      id: post.id,
      title: newTitle,
      text: newText,
    });
  });

  it('DELETE /posts/:id => should return Not Found if id does not exist', async () => {
    const response = await request(app.getHttpServer()).delete('/posts/2');

    expect(response.statusCode).toBe(404);
  });

  it('DELETE /posts/:id => should return Forbidden if post is being used', async () => {
    const post = await prisma.post.create({
      data: {
        title: faker.company.name(),
        text: faker.lorem.paragraph(),
      },
    });
    const media = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });
    await prisma.publication.create({
      data: {
        mediaId: media.id,
        postId: post.id,
        date: faker.date.future(),
      },
    });

    const response = await request(app.getHttpServer()).delete(
      `/posts/${post.id}`,
    );

    expect(response.statusCode).toBe(403);
  });

  it('DELETE /posts/:id => should delete a post', async () => {
    const title = faker.company.name();
    const text = faker.lorem.paragraph();
    const post = await prisma.post.create({
      data: {
        title,
        text,
      },
    });

    const response = await request(app.getHttpServer()).delete(
      `/posts/${post.id}`,
    );
    expect(response.statusCode).toBe(200);

    const verifyDelete = await request(app.getHttpServer()).get(
      `/posts/${post.id}`,
    );
    expect(verifyDelete.statusCode).toBe(404);
  });

  it('POST /publications => should return Bad Request when body is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/publications')
      .send({ title: faker.company.name() });

    expect(response.statusCode).toBe(400);
  });

  it('POST /publications => should return NotFound if media does not exist', async () => {
    const media = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });
    await prisma.media.delete({ where: { id: media.id } });
    const post = await prisma.post.create({
      data: {
        title: faker.company.name(),
        text: faker.lorem.paragraph(),
      },
    });

    const response = await request(app.getHttpServer())
      .post('/publications')
      .send({ postId: post.id, mediaId: media.id, date: faker.date.past() });

    expect(response.statusCode).toBe(404);
  });

  it('POST /publications => should return NotFound if post does not exist', async () => {
    const media = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });
    const post = await prisma.post.create({
      data: {
        title: faker.company.name(),
        text: faker.lorem.paragraph(),
        image: faker.image.url(),
      },
    });
    await prisma.post.delete({ where: { id: post.id } });

    const response = await request(app.getHttpServer())
      .post('/publications')
      .send({ mediaId: media.id, postId: post.id, date: faker.date.past() });

    expect(response.statusCode).toBe(404);
  });

  it('POST publications => should create a publication', async () => {
    const media = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });
    const post = await prisma.post.create({
      data: {
        title: faker.company.name(),
        text: faker.lorem.paragraph(),
        image: faker.image.url(),
      },
    });

    const response = await request(app.getHttpServer())
      .post('/publications')
      .send({ mediaId: media.id, postId: post.id, date: faker.date.past() });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(Number),
      mediaId: media.id,
      postId: post.id,
      date: expect.any(String),
    });
  });

  it('GET /publications => should return an empty array if there are no publications', async () => {
    const response = await request(app.getHttpServer()).get('/publications');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('GET /publications => should return all publications', async () => {
    const media = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });
    const post = await prisma.post.create({
      data: {
        title: faker.company.name(),
        text: faker.lorem.paragraph(),
        image: faker.image.url(),
      },
    });
    await prisma.publication.create({
      data: {
        mediaId: media.id,
        postId: post.id,
        date: faker.date.past(),
      },
    });

    const response = await request(app.getHttpServer()).get('/publications');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      {
        id: expect.any(Number),
        mediaId: media.id,
        postId: post.id,
        date: expect.any(String),
      },
    ]);
  });

  it('GET /publications?published=true => should return all published publications', async () => {
    const media = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });
    const post = await prisma.post.create({
      data: {
        title: faker.company.name(),
        text: faker.lorem.paragraph(),
        image: faker.image.url(),
      },
    });
    await prisma.publication.create({
      data: {
        mediaId: media.id,
        postId: post.id,
        date: faker.date.past(),
      },
    });
    const response = await request(app.getHttpServer()).get(
      '/publications?published=true',
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      {
        id: expect.any(Number),
        mediaId: media.id,
        postId: post.id,
        date: expect.any(String),
      },
    ]);
  });

  it('GET /publications/:id => should return Not Found if id does not exist', async () => {
    const response = await request(app.getHttpServer()).get('/publications/1');

    expect(response.statusCode).toBe(404);
  });

  it('GET /publications/:id => should return a publication', async () => {
    const media = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });
    const post = await prisma.post.create({
      data: {
        title: faker.company.name(),
        text: faker.lorem.paragraph(),
        image: faker.image.url(),
      },
    });
    const publication = await prisma.publication.create({
      data: {
        mediaId: media.id,
        postId: post.id,
        date: faker.date.past(),
      },
    });

    const response = await request(app.getHttpServer()).get(
      `/publications/${publication.id}`,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      id: publication.id,
      mediaId: media.id,
      postId: post.id,
      date: expect.any(String),
    });
  });

  it('PUT /publications/:id => should return Not Found if id does not exist', async () => {
    const response = await request(app.getHttpServer())
      .put('/publications/2')
      .send({
        mediaId: 1,
        postId: 1,
        date: faker.date.past(),
      });

    expect(response.statusCode).toBe(404);
  });

  it('PUT /publications/:id => should return Conflict if publication is already posted', async () => {
    const media = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });
    const post = await prisma.post.create({
      data: {
        title: faker.company.name(),
        text: faker.lorem.paragraph(),
        image: faker.image.url(),
      },
    });
    const publication = await prisma.publication.create({
      data: {
        mediaId: media.id,
        postId: post.id,
        date: faker.date.past(),
      },
    });
    const newMedia = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/publications/${publication.id}`)
      .send({
        mediaId: newMedia.id,
        postId: post.id,
        date: publication.date,
      });

    expect(response.statusCode).toBe(403);
  });

  it('PUT publications/:id => should update a publication', async () => {
    const media = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });
    const post = await prisma.post.create({
      data: {
        title: faker.company.name(),
        text: faker.lorem.paragraph(),
        image: faker.image.url(),
      },
    });
    const publication = await prisma.publication.create({
      data: {
        mediaId: media.id,
        postId: post.id,
        date: faker.date.future(),
      },
    });
    const newMedia = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });
    const newPost = await prisma.post.create({
      data: {
        title: faker.company.name(),
        text: faker.lorem.paragraph(),
        image: faker.image.url(),
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/publications/${publication.id}`)
      .send({
        mediaId: newMedia.id,
        postId: newPost.id,
        date: new Date(),
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      id: publication.id,
      mediaId: newMedia.id,
      postId: newPost.id,
      date: expect.any(String),
    });
  });

  it('DELETE /publications/:id => should return Not Found if id does not exist', async () => {
    const response = await request(app.getHttpServer()).delete(
      '/publications/1',
    );

    expect(response.statusCode).toBe(404);
  });

  it('DELETE /publications/:id => should delete a publication', async () => {
    const media = await prisma.media.create({
      data: {
        title: faker.company.name(),
        username: faker.internet.userName(),
      },
    });
    const post = await prisma.post.create({
      data: {
        title: faker.company.name(),
        text: faker.lorem.paragraph(),
        image: faker.image.url(),
      },
    });
    const publication = await prisma.publication.create({
      data: {
        mediaId: media.id,
        postId: post.id,
        date: faker.date.past(),
      },
    });

    const response = await request(app.getHttpServer()).delete(
      `/publications/${publication.id}`,
    );
    expect(response.statusCode).toBe(200);

    const verifyDelete = await request(app.getHttpServer()).get(
      `/publications/${publication.id}`,
    );
    expect(verifyDelete.statusCode).toBe(404);
  });
});
