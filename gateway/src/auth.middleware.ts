import { HttpService } from '@nestjs/axios';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) { }

  async use(req: any, res: any, next: () => void) {
    const publicRoutes = ['/auth/register', '/auth/login', '/auth/refresh'];
    const path = req.baseUrl;
    console.log("[middleware] path : ", path, "req ",req.baseUrl);
    if (publicRoutes.includes(path)) {
      next();
    }
    else {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(401).json({ message: 'Unauthorized!' });
        return;
      }
      console.log('Token : ', token);
      const requestConfig: AxiosRequestConfig = {
        url: this.configService.get('AUTH_SERVICE_URL') + '/auth/verify',
        method: 'POST',
        data: { token: token },
        headers: {}
      };
      try {
        const response = await firstValueFrom(
          this.httpService.request<any>(requestConfig)
        )
        if (response) {
          const userId = response.data.userId;
          const email = response.data.email;
          req.headers['x-user-id'] = userId;
          req.headers['x-user-email'] = email;
          next();
        }
      } catch (err) {
        console.log('Error : ', err);
        return res.status(401).json({ message: "Unauthorized" });
      }
    }
  }
}
