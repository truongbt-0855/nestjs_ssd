import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (property: string | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<{ user?: Record<string, unknown> }>();
    const user = request.user ?? {};

    if (!property) {
      return user;
    }

    return user[property];
  },
);
