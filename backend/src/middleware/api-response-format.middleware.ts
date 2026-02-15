import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiResponseFormatMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const oldJson = res.json;
    res.json = function (body: any) {
      if (body && typeof body === 'object' && ('data' in body || 'message' in body)) {
        return oldJson.call(this, body);
      }
      return oldJson.call(this, { data: body, message: 'Success' });
    };
    next();
  }
}
