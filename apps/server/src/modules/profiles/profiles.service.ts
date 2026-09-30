import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ProfileDetail, ProfileListItem } from '@repo/contracts';
import { profileDetailSchema, profileListItemSchema } from '@repo/contracts';

import {
  profileDetailInclude,
  type ProfileDetailRow,
  profileListInclude,
  type ProfileListRow,
  toFinancialHolder,
  toProfileFinancialPosition,
} from '@/modules/common/mappers/financial-records';
import { PaginationService } from '@/modules/pagination/pagination.service';
import type {
  OffsetPagination,
  OffsetPaginationResult,
} from '@/modules/pagination/pagination.utils';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  type CreateProfileRequest,
  profileCreateInputSchema,
  type ProfileResponse,
  profileRowSchema,
  profileUpdateInputSchema,
  type UpdateProfileRequest,
} from '@/modules/profiles/models/profile.dto';

const toProfileListItem = (row: ProfileListRow): ProfileListItem => {
  const { financial_holder: financialHolder, ...scalars } = row;
  return profileListItemSchema.parse({
    ...profileRowSchema.parse(scalars),
    financialHolder:
      financialHolder === null ? null : toFinancialHolder(financialHolder),
  });
};

const toProfileDetail = (row: ProfileDetailRow): ProfileDetail => {
  const { financial_holder: financialHolder, ...scalars } = row;
  return profileDetailSchema.parse({
    ...profileRowSchema.parse(scalars),
    financialHolder:
      financialHolder === null
        ? null
        : toProfileFinancialPosition(financialHolder),
  });
};

function isPrismaKnownRequestError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationService
  ) {}

  async list(
    pagination: OffsetPagination
  ): Promise<OffsetPaginationResult<ProfileListItem>> {
    const result = await this.pagination.offsetPaginate<
      ProfileListRow,
      'profile'
    >({
      model: this.prisma.profile as never,
      pagination,
      include: profileListInclude,
    });
    return {
      ...result,
      data: (result.data as Array<ProfileListRow>).map((row) =>
        toProfileListItem(row)
      ),
    };
  }

  async getById(profileId: string): Promise<ProfileDetail> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: profileDetailInclude,
    });
    if (!profile) {
      throw new NotFoundException(`Profile ${profileId} not found`);
    }
    return toProfileDetail(profile);
  }

  async create(data: CreateProfileRequest): Promise<ProfileResponse> {
    try {
      const profile = await this.prisma.profile.create({
        data: profileCreateInputSchema.parse(data),
      });
      return profileRowSchema.parse(profile);
    } catch (error) {
      this.rethrowUniqueConflict(error);
    }
  }

  async update(
    profileId: string,
    data: UpdateProfileRequest
  ): Promise<ProfileResponse> {
    try {
      const profile = await this.prisma.profile.update({
        where: { id: profileId },
        data: profileUpdateInputSchema.parse(data),
      });
      return profileRowSchema.parse(profile);
    } catch (error) {
      if (isPrismaKnownRequestError(error) && error.code === 'P2025') {
        throw new NotFoundException(`Profile ${profileId} not found`);
      }
      this.rethrowUniqueConflict(error);
    }
  }

  async delete(profileId: string): Promise<void> {
    try {
      await this.prisma.profile.delete({ where: { id: profileId } });
    } catch (error) {
      if (isPrismaKnownRequestError(error) && error.code === 'P2025') {
        throw new NotFoundException(`Profile ${profileId} not found`);
      }
      throw error;
    }
  }

  private rethrowUniqueConflict(error: unknown): never {
    if (isPrismaKnownRequestError(error) && error.code === 'P2002') {
      throw new ConflictException(
        'A profile with this unique field already exists'
      );
    }
    throw error;
  }
}
