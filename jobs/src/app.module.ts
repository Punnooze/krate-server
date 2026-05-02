import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [JobsModule, BullModule.forRoot({
    connection: {
      url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    }
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
