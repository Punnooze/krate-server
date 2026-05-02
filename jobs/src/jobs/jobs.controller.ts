import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) { }

    @Post()
    async create(@Body() dto: CreateJobDto) {
        return await this.jobsService.createJob(dto);
    }

    @Get('project/:projectId')
    async findAll(@Param('projectId') projectId: string) {
        return await this.jobsService.findAllJobs(projectId);
    }

    @Get('/:id')
    async findOne(@Param('id') id: string) {
        return await this.jobsService.findJob(id);
    }

    @Patch('/:id')
    async update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
        return await this.jobsService.updateJob(id, dto);
    }

    @Delete('/:id')
    async delete(@Param('id') id: string) {
        return await this.jobsService.deleteJob(id);
    }
}
