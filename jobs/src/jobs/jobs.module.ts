import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'jobs-queue',
    })
  ],
  controllers: [JobsController],
  providers: [JobsService]
})
export class JobsModule { }
