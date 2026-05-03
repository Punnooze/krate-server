import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { BullModule } from '@nestjs/bullmq';
import { JobsProcessor } from './jobs.processor';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'jobs-queue',
    }), HttpModule
  ],
  controllers: [JobsController],
  providers: [JobsService, JobsProcessor, PrismaService]
})
export class JobsModule { }
