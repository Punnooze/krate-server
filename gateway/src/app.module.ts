import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ProxyModule } from './proxy/proxy.module';
import { AuthController } from './auth/auth.controller';
import { AuthMiddleware } from './auth.middleware';

@Module({
  imports: [
    HttpModule,
    ProxyModule,
    ConfigModule.forRoot(
      { isGlobal: true }
    ),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
