import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import { handleContextUser } from '@/modules/auth/context';

export interface IUser {
  id: string;
  /** Linked `profile.id`, null when the user has no profile yet. */
  profileId: string | null;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export const User = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) =>
    handleContextUser(data, context)
);
