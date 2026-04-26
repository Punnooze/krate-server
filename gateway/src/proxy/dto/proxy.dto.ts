export type HttpMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export class ProxyDto {
    targetServiceUrl!: string;
    apiPath!: string;
    httpMethod!: HttpMethods;
    body?: any;
    headers?: Record<string, string>;
}