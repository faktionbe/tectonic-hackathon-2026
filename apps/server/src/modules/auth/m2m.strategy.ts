import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';

import { env } from '@/env';
import { secureTokenEquals } from '@/modules/auth/m2m.token';

export interface IM2mActor {
  type: 'm2m';
}

@Injectable()
export class M2mStrategy extends PassportStrategy(Strategy, 'm2m') {
  /**
   * Return `false` on mismatch so AuthGuard(['m2m', 'jwt']) can try the next strategy.
   */
  validate(token: string): IM2mActor | false {
    if (!secureTokenEquals(token, env.M2M_JWT)) {
      return false;
    }

    return { type: 'm2m' };
  }
}
