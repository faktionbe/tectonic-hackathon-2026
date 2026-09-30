import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { ROLES_KEY } from '@/modules/auth/auth.decorator';
import { M2mGuard } from '@/modules/common/guards/m2m.guard';
import { RolesGuard } from '@/modules/common/guards/roles.guard';

/**
 * Accepts the shared M2M bearer token or a normal user JWT.
 * Replaces `@Auth()` on routes the agent service must call.
 */
export function M2M(...roles: Array<string>) {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(M2mGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' })
  );
}
