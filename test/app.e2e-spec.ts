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

  it('POST /medias => should create a media', async () => {
    const title = faker.company.name();
    const username = faker.internet.userName();
    const response = await request(app.getHttpServer())
      .post('/medias')
      .send({ title, username });

    expect(response.statusCode).toBe(201);
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
});
