import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('jobs-queue') private readonly jobsQueue: Queue,
    ) { }

    async createJob(createJobDto: CreateJobDto) {

        const job = await this.prisma.job.create({
            data: {
                name: createJobDto.name,
                cronSchedule: createJobDto.cronSchedule,
                webhookUrl: createJobDto.webhookUrl,
                projectId: createJobDto.projectId,
            }
        })

        await this.jobsQueue.upsertJobScheduler(
            `execute-job-${job.id}`,
            { pattern: createJobDto.cronSchedule },
            {
                name: 'execute-job',
                data: { jobId: job.id },
            },
        );
        return job;
    }

    async findAllJobs(projectId: string) {
        return await this.prisma.job.findMany({ where: { projectId } });
    }

    async findJob(id: string) {
        const job = await this.prisma.job.findUnique({ where: { id } });
        if (!job) {
            throw new NotFoundException('Job not found');
        }
        return job;
    }

    async updateJob(id: string, updateJobDto: UpdateJobDto) {
        const job = await this.prisma.job.update({
            where: { id },
            data: updateJobDto
        });
        if (updateJobDto.cronSchedule) {
            await this.jobsQueue.upsertJobScheduler(
                `execute-job-${job.id}`,
                { pattern: updateJobDto.cronSchedule },
                {
                    name: 'execute-job',
                    data: { jobId: job.id },
                },
            );
        }

        return job;
    }

    async deleteJob(id: string) {
        const job = await this.prisma.job.delete({ where: { id } });
        await this.jobsQueue.removeJobScheduler(`execute-job-${job.id}`);
        return job;
    }
}

