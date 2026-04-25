import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { ConfigService } from '@nestjs/config';

@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly proxyService: ProxyService, private readonly configService: ConfigService) { }

    @Post()
    async create(@Body() body: any, @Req() req: any) {
        return this.proxyService.forward({
            targetServiceUrl: this.configService.get<string>('PROJECT_SERVICE_URL')!,
            apiPath: "/organizations",
            httpMethod: "POST",
            body: body,
            headers: {
                'x-user-id': req.headers['x-user-id']
            }
        })
    }

    @Get()
    async findAll(@Req() req: any) {
        return this.proxyService.forward({
            targetServiceUrl: this.configService.get<string>('PROJECT_SERVICE_URL')!,
            apiPath: "/organizations",
            httpMethod: "GET",
            headers: {
                'x-user-id': req.headers['x-user-id']
            }
        })
    }

    @Get('/:id')
    async findOne(@Param('id') id: string, @Req() req: any) {
        return this.proxyService.forward({
            targetServiceUrl: this.configService.get<string>('PROJECT_SERVICE_URL')!,
            apiPath: `/organizations/${id}`,
            httpMethod: "GET",
            headers: {
                'x-user-id': req.headers['x-user-id']
            }
        })
    }

    @Patch('/:id')
    async update(@Body() body: any, @Param('id') id: string, @Req() req: any) {
        return this.proxyService.forward({
            targetServiceUrl: this.configService.get<string>('PROJECT_SERVICE_URL')!,
            apiPath: `/organizations/${id}`,
            httpMethod: "PATCH",
            body: body,
            headers: {
                'x-user-id': req.headers['x-user-id']
            }
        })
    }

    @Delete('/:id')
    async delete(@Param('id') id: string, @Req() req: any) {
        return this.proxyService.forward({
            targetServiceUrl: this.configService.get<string>('PROJECT_SERVICE_URL')!,
            apiPath: `/organizations/${id}`,
            httpMethod: "DELETE",
            headers: {
                'x-user-id': req.headers['x-user-id']
            }
        })
    }

}
