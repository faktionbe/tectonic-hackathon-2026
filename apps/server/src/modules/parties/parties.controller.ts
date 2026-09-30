import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { partySchema } from '@repo/contracts';

import { Auth } from '@/modules/auth/auth.decorator';
import { ApiOffsetPagination } from '@/modules/common/decorators/api-offset-pagination.decorator';
import {
  type OffsetPagination,
  offsetPaginationSchema,
} from '@/modules/pagination/pagination.utils';
import {
  type CreateParty,
  createPartySchema,
  partiesPageSchema,
  type UpdateParty,
  updatePartySchema,
} from '@/modules/parties/models/party.dto';
import { PartiesService } from '@/modules/parties/parties.service';

@Controller('parties')
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Get()
  @Auth()
  @ApiOperation({ operationId: 'getParties', summary: 'List parties' })
  @ApiOffsetPagination()
  @ApiOkResponse({ standardSchema: partiesPageSchema })
  @SerializeOptions({ schema: partiesPageSchema })
  async findAll(
    @Query({ schema: offsetPaginationSchema }) pagination: OffsetPagination
  ) {
    return this.partiesService.findAll(pagination);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ operationId: 'getParty', summary: 'Get a party' })
  @ApiOkResponse({ standardSchema: partySchema })
  @SerializeOptions({ schema: partySchema })
  async findOne(@Param('id') id: string) {
    return this.partiesService.findOne(id);
  }

  @Post()
  @Auth()
  @ApiOperation({ operationId: 'createParty', summary: 'Create a party' })
  @ApiOkResponse({ standardSchema: partySchema })
  @SerializeOptions({ schema: partySchema })
  async create(@Body({ schema: createPartySchema }) body: CreateParty) {
    return this.partiesService.create(body);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ operationId: 'updateParty', summary: 'Update a party' })
  @ApiOkResponse({ standardSchema: partySchema })
  @SerializeOptions({ schema: partySchema })
  async update(
    @Param('id') id: string,
    @Body({ schema: updatePartySchema }) body: UpdateParty
  ) {
    return this.partiesService.update(id, body);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ operationId: 'deleteParty', summary: 'Delete a party' })
  @ApiOkResponse({ standardSchema: partySchema })
  @SerializeOptions({ schema: partySchema })
  async remove(@Param('id') id: string) {
    return this.partiesService.remove(id);
  }
}
