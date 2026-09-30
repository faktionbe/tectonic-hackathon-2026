import { Injectable, NotFoundException } from '@nestjs/common';
import type { ExpenseCategory, Party, PartyKind } from '@repo/contracts';
import { Prisma } from '@repo/database';

import { orUndefined } from '@/modules/common/utils/serialization';
import { PaginationService } from '@/modules/pagination/pagination.service';
import type { OffsetPagination } from '@/modules/pagination/pagination.utils';
import {
  type CreateParty,
  type UpdateParty,
} from '@/modules/parties/models/party.dto';
import { PrismaService } from '@/modules/prisma/prisma.service';

type PartyRow = Prisma.partyGetPayload<Record<string, never>>;

function toPartyDto(row: PartyRow): Party {
  return {
    id: row.id,
    kind: row.kind as PartyKind,
    name: row.name,
    iban: orUndefined(row.iban),
    countryCode: orUndefined(row.country_code),
    category: orUndefined(row.category) as ExpenseCategory | undefined,
    logoUrl: orUndefined(row.logo_url),
    website: orUndefined(row.website),
    externalId: orUndefined(row.external_id),
  };
}

@Injectable()
export class PartiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService
  ) {}

  async findAll(pagination: OffsetPagination) {
    const page = await this.paginationService.offsetPaginate<PartyRow, 'party'>(
      {
        model: this.prisma.party,
        pagination,
        orderBy: 'createdAt',
      }
    );
    return { ...page, data: (page.data as Array<PartyRow>).map(toPartyDto) };
  }

  async findOne(id: string): Promise<Party> {
    const row = await this.prisma.party.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Party ${id} not found`);
    }
    return toPartyDto(row);
  }

  async create(dto: CreateParty): Promise<Party> {
    const row = await this.prisma.party.create({
      data: {
        kind: dto.kind,
        name: dto.name,
        iban: dto.iban,
        country_code: dto.countryCode,
        category: dto.category,
        logo_url: dto.logoUrl,
        website: dto.website,
        external_id: dto.externalId,
      },
    });
    return toPartyDto(row);
  }

  async update(id: string, dto: UpdateParty): Promise<Party> {
    await this.findOne(id);
    const row = await this.prisma.party.update({
      where: { id },
      data: {
        kind: dto.kind,
        name: dto.name,
        iban: dto.iban,
        country_code: dto.countryCode,
        category: dto.category,
        logo_url: dto.logoUrl,
        website: dto.website,
        external_id: dto.externalId,
      },
    });
    return toPartyDto(row);
  }

  async remove(id: string): Promise<Party> {
    const party = await this.findOne(id);
    await this.prisma.party.delete({ where: { id } });
    return party;
  }
}
