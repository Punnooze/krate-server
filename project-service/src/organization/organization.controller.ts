import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationDto } from './dto/organization.dto';

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
}

