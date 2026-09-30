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

import { Auth } from '@/modules/auth/auth.decorator';
import { ApiOffsetPagination } from '@/modules/common/decorators/api-offset-pagination.decorator';
import type { OffsetPagination } from '@/modules/pagination/pagination.utils';
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
  @Auth()
  @ApiOffsetPagination()
  @ApiOperation({
    operationId: 'listProfiles',
    summary: 'List profiles',
  })
  @ApiOkResponse({ standardSchema: offsetPaginatedProfilesSchema })
  @SerializeOptions({ schema: offsetPaginatedProfilesSchema })
  async list(@Query() query: OffsetPagination) {
    return this.profilesService.list(query);
  }

  @Get(':profileId')
  @Auth()
  @ApiOperation({
    operationId: 'getProfileById',
    summary: 'Get profile by id',
  })
  @ApiOkResponse({ standardSchema: profileResponseSchema })
  @SerializeOptions({ schema: profileResponseSchema })
  async getById(@Param('profileId') profileId: string) {
    return this.profilesService.getById(profileId);
  }

  @Post()
  @Auth()
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
  @Auth()
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
  @Auth()
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
