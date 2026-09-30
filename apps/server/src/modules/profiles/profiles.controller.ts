import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { profileDetailSchema } from '@repo/contracts';

import { M2M } from '@/modules/auth/m2m.decorator';
import { ApiOffsetPagination } from '@/modules/common/decorators/api-offset-pagination.decorator';
import {
  type OffsetPagination,
  offsetPaginationSchema,
} from '@/modules/pagination/pagination.utils';
import {
  type CreateProfileRequest,
  createProfileSchema,
  offsetPaginatedProfilesSchema,
  profileResponseSchema,
  type UpdateProfileRequest,
  updateProfileSchema,
} from '@/modules/profiles/models/profile.dto';
import { ProfilesService } from '@/modules/profiles/profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @M2M()
  @ApiOffsetPagination()
  @ApiOperation({
    operationId: 'listProfiles',
    summary: 'List profiles',
  })
  @ApiOkResponse({ standardSchema: offsetPaginatedProfilesSchema })
  @SerializeOptions({ schema: offsetPaginatedProfilesSchema })
  async list(
    @Query({ schema: offsetPaginationSchema }) query: OffsetPagination
  ) {
    return this.profilesService.list(query);
  }

  @Get(':profileId')
  @M2M()
  @ApiOperation({
    operationId: 'getProfileById',
    summary: 'Get profile by id',
  })
  @ApiOkResponse({ standardSchema: profileDetailSchema })
  @SerializeOptions({ schema: profileDetailSchema })
  async getById(@Param('profileId') profileId: string) {
    return this.profilesService.getById(profileId);
  }

  @Post()
  @M2M()
  @ApiOperation({
    operationId: 'createProfile',
    summary: 'Create profile',
  })
  @ApiCreatedResponse({ standardSchema: profileResponseSchema })
  @SerializeOptions({ schema: profileResponseSchema })
  async create(
    @Body({ schema: createProfileSchema }) body: CreateProfileRequest
  ) {
    return this.profilesService.create(body);
  }

  @Patch(':profileId')
  @M2M()
  @ApiOperation({
    operationId: 'updateProfile',
    summary: 'Update profile',
  })
  @ApiOkResponse({ standardSchema: profileResponseSchema })
  @SerializeOptions({ schema: profileResponseSchema })
  async update(
    @Param('profileId') profileId: string,
    @Body({ schema: updateProfileSchema }) body: UpdateProfileRequest
  ) {
    return this.profilesService.update(profileId, body);
  }

  @Delete(':profileId')
  @M2M()
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteProfile',
    summary: 'Delete profile',
  })
  @ApiNoContentResponse()
  async delete(@Param('profileId') profileId: string): Promise<void> {
    await this.profilesService.delete(profileId);
  }
}
