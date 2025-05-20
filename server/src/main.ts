import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    app.enableCors(); // Enable CORS for frontend communication
    await app.listen(process.env.PORT ?? 5000); // Use environment variable for port or default to 5000
}

bootstrap();
