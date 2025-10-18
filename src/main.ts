import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; 
import { RolesGuard } from './auth/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({ origin: '*', allowedHeaders: '*', methods: '*' });

  const config = new DocumentBuilder()
    .setTitle('Nest API')
    .setDescription('API documentation')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'Nest API Docs',
  });

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new RolesGuard(reflector));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server: http://localhost:${port}`);
  console.log(`📘 Swagger: http://localhost:${port}/docs`);
}
bootstrap();
