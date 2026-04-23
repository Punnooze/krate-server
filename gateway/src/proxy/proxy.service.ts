import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { ProxyDto } from './dto/proxy.dto';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
    constructor(private readonly httpService: HttpService) { }

    async forward(dto: ProxyDto) {
        const path = dto.targetServiceUrl + dto.apiPath;
        console.log("[Proxy Service] path : ", path);
        const requestConfig: AxiosRequestConfig = {
            url: path,
            method: dto.httpMethod,
            data: dto.body,
            headers: dto.headers,
        };

        try {
            const response = await firstValueFrom(
                this.httpService.request<any>(requestConfig),
            );
            return response.data;
        } catch (error: any) {
            const status = error.response.status ?? 500;
            const message = error.response.message ?? "Internal Server Error!";
            throw new HttpException(message, status);
        }
    }
}
