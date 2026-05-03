import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { PrismaService } from '../prisma.service';
import { ExecutionStatus } from './dto/job-execution.dto';
import { firstValueFrom } from 'rxjs';


@Processor('jobs-queue')
export class JobsProcessor extends WorkerHost {
    constructor(
        private readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {
        super();
    }

    async process(job: Job) {
        const findJob = await this.prisma.job.findUnique({ where: { id: job.data.jobIdd } })
        if (!findJob?.isActive) {
            return;
        }

        const jobExecution = await this.prisma.jobExecution.create({
            data: {
                jobId: findJob.id,
                status: ExecutionStatus.RUNNING,
            }
        });

        const requestConfig: AxiosRequestConfig = {
            url: findJob.webhookUrl,
            method: 'POST',
        };
        try {

            const response = await firstValueFrom(this.httpService.request<any>(requestConfig));
            if (response) {
                return await this.prisma.jobExecution.update({
                    where: { id: jobExecution.id },
                    data: {
                        status: ExecutionStatus.SUCCESS,
                        responseCode: response.status
                    }
                });
            }
        } catch (e: unknown) {
            const errorMessage =
                e instanceof Error ? e.message : 'Unknown webhook execution error';
            return await this.prisma.jobExecution.update({
                where: { id: jobExecution.id },
                data: {
                    status: ExecutionStatus.FAILED,
                    errorMessage,
                }
            });
        }
    }
}