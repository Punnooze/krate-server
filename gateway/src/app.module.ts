import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ProxyModule } from './proxy/proxy.module';
import { AuthController } from './auth/auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis'
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    HttpModule,
    ProxyModule,
    ConfigModule.forRoot(
      { isGlobal: true }
    ),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
      storage: new ThrottlerStorageRedisService(
        new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')
      ),
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [AuthMiddleware,
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
