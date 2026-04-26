import { Body, Controller, Post, Req } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(private readonly proxyService: ProxyService, private readonly configService: ConfigService) { }

    @Post('register')
    async register(@Body() body: any) {
        return this.proxyService.forward({
            targetServiceUrl: this.configService.get<string>('AUTH_SERVICE_URL')!,
            apiPath: "/auth/register",
            httpMethod: "POST",
            body: body,
            headers: {},
        });
    }

    @Post('login')
    async login(@Body() body: any) {
        return this.proxyService.forward({
            targetServiceUrl: this.configService.get<string>('AUTH_SERVICE_URL')!,
            apiPath: "/auth/login",
            httpMethod: "POST",
            body: body,
            headers: {},
        });
    }


    @Post('refresh')
    async refresh(@Body() body: any, @Req() req: any) {
        return this.proxyService.forward({
            targetServiceUrl: this.configService.get<string>('AUTH_SERVICE_URL')!,
            apiPath: "/auth/refresh",
            httpMethod: "POST",
            body: body,
            headers: {
                authorization: req.headers.authorization,
            },
        });
    }


    @Post('logout')
    async logout(@Body() body: any, @Req() req: any) {
        return this.proxyService.forward({
            targetServiceUrl: this.configService.get<string>('AUTH_SERVICE_URL')!,
            apiPath: "/auth/logout",
            httpMethod: "POST",
            body: body,
            headers: {
                authorization: req.headers.authorization,
            },
        });
    }
}
