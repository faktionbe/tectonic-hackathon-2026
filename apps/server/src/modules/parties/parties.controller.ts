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
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { partySchema } from '@repo/contracts';

import { M2M } from '@/modules/auth/m2m.decorator';
import { ApiOffsetPagination } from '@/modules/common/decorators/api-offset-pagination.decorator';
import {
  type CreateParty,
  createPartySchema,
  type ListPartiesQuery,
  listPartiesQuerySchema,
  partiesPageSchema,
  type UpdateParty,
  updatePartySchema,
} from '@/modules/parties/models/party.dto';
import { PartiesService } from '@/modules/parties/parties.service';

@Controller('parties')
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Get()
  @M2M()
  @ApiOperation({ operationId: 'getParties', summary: 'List parties' })
  @ApiOffsetPagination()
  @ApiQuery({
    name: 'ids',
    required: false,
    type: String,
    description: 'Comma-separated party ids to filter by',
  })
  @ApiOkResponse({ standardSchema: partiesPageSchema })
  @SerializeOptions({ schema: partiesPageSchema })
  async findAll(
    @Query({ schema: listPartiesQuerySchema }) query: ListPartiesQuery
  ) {
    return this.partiesService.findAll(query);
  }

  @Get(':id')
  @M2M()
  @ApiOperation({ operationId: 'getParty', summary: 'Get a party' })
  @ApiOkResponse({ standardSchema: partySchema })
  @SerializeOptions({ schema: partySchema })
  async findOne(@Param('id') id: string) {
    return this.partiesService.findOne(id);
  }

  @Post()
  @M2M()
  @ApiOperation({ operationId: 'createParty', summary: 'Create a party' })
  @ApiOkResponse({ standardSchema: partySchema })
  @SerializeOptions({ schema: partySchema })
  async create(@Body({ schema: createPartySchema }) body: CreateParty) {
    return this.partiesService.create(body);
  }

  @Patch(':id')
  @M2M()
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
  @M2M()
  @ApiOperation({ operationId: 'deleteParty', summary: 'Delete a party' })
  @ApiOkResponse({ standardSchema: partySchema })
  @SerializeOptions({ schema: partySchema })
  async remove(@Param('id') id: string) {
    return this.partiesService.remove(id);
  }
}
