import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());

  // CORS
  const corsEnabled = configService.get<boolean>('app.cors.enabled');
  if (corsEnabled) {
    app.enableCors({
      origin: configService.get<string[]>('app.cors.origin'),
      credentials: true,
    });
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const swaggerEnabled = configService.get<boolean>('app.swagger.enabled');
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle(configService.get<string>('app.swagger.title') || 'API')
      .setDescription(configService.get<string>('app.swagger.description') || 'API Documentation')
      .setVersion(configService.get<string>('app.swagger.version') || '1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(
      configService.get<string>('app.swagger.path') || 'api',
      app,
      document,
    );
  }

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);

  console.log(`\n🚀 Application is running on: http://localhost:${port}`);
  if (swaggerEnabled) {
    console.log(
      `📚 Swagger documentation: http://localhost:${port}/${configService.get<string>('app.swagger.path') || 'api'}`,
    );
  }
  console.log('\n');
}
bootstrap();
