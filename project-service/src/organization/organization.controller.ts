import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationDto } from './dto/organization.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { ProjectDto } from './dto/project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('organizations')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) { }

    @Post()
    async create(@Body() dto: OrganizationDto, @Headers('x-user-id') userId: string) {
        return await this.organizationService.create(dto, userId);
    }

    @Get()
    async findAll(@Headers('x-user-id') userId: string) {
        return await this.organizationService.findAll(userId);
    }

    @Get('/:id')
    async findOne(@Headers('x-user-id') userId: string, @Param('id') id: string) {
        return await this.organizationService.findOne(userId, id);
    }

    @Patch('/:id')
    async update(@Headers('x-user-id') userId: string, @Param('id') id: string, @Body() dto: OrganizationDto) {
        return await this.organizationService.update(userId, id, dto);
    }

    @Delete('/:id')
    async delete(@Headers('x-user-id') userId: string, @Param('id') id: string) {
        return await this.organizationService.delete(userId, id);
    }

    @Post('/:id/members')
    async inviteMember(@Headers('x-user-id') userId: string, @Param('id') id: string, @Body() dto: InviteMemberDto) {
        return await this.organizationService.inviteMember(userId, id, dto);
    }

    @Get('/:id/members')
    async getMember(@Headers('x-user-id') userId: string, @Param('id') id: string) {
        return await this.organizationService.getMembers(userId, id);
    }

    @Patch('/:id/members/:memberId')
    async updateMember(@Headers('x-user-id') userId: string, @Param('id') id: string, @Param('memberId') memberId: string, @Body() dto: InviteMemberDto) {
        return await this.organizationService.updateMember(userId, id, memberId, dto);
    }


    @Delete('/:id/members/:memberId')
    async deleteMember(@Headers('x-user-id') userId: string, @Param('id') id: string, @Param('memberId') memberId: string) {
        return await this.organizationService.deleteMember(userId, id, memberId);
    }

    @Post('/:id/projects')
    async createProject(@Headers('x-user-id') userId: string, @Param('id') id: string, @Body() dto: ProjectDto) {
        return await this.organizationService.createProject(userId, id, dto);
    }

    @Get('/:id/projects')
    async getAllProjects(@Headers('x-user-id') userId: string, @Param('id') id: string) {
        return await this.organizationService.getAllProjects(userId, id);
    }


    @Get('/:id/projects/:projectId')
    async getProject(@Headers('x-user-id') userId: string, @Param('id') id: string, @Param('projectId') projecId: string) {
        return await this.organizationService.getProject(userId, id, projecId);
    }

    @Patch('/:id/projects/:projectId')
    async updateProject(@Headers('x-user-id') userId: string, @Param('id') id: string, @Param('projectId') projecId: string, @Body() dto: UpdateProjectDto) {
        return await this.organizationService.updateProject(userId, id, projecId, dto);
    }

    @Delete('/:id/projects/:projectId')
    async deleteProject(@Headers('x-user-id') userId: string, @Param('id') id: string, @Param('projectId') projecId: string) {
        return await this.organizationService.deleteProject(userId, id, projecId);
    }
}

