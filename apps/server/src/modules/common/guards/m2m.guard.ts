import { type ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { handleContext } from '@/modules/auth/context';

@Injectable()
export class M2mGuard extends AuthGuard(['m2m', 'jwt']) {
  getRequest(context: ExecutionContext) {
    return handleContext(context);
  }
}
