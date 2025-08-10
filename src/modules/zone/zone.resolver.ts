import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Int,
} from '@nestjs/graphql';
import { ZoneService } from './zone.service';
import { Zone, ZoneDocument } from './schemas/zone.schema';
import { CreateZoneInput } from './inputs/zone.input';
import { Language } from '../../common/decorators/language.decorator';
import { ZoneFilterInput } from './inputs/zone-filter.input';
import { ZonePaginationResponse } from './types/zone-pagination-response.type';
import { ZoneType } from './types/zone.type';

@Resolver()
export class ZoneResolver {
  constructor(private readonly zoneService: ZoneService) {}

  @Mutation(() => ZoneType)
  async createZone(
    @Args('createZoneInput') createZoneInput: CreateZoneInput,
    @Language() language?: string,
  ): Promise<Zone> {
    return this.zoneService.create(createZoneInput, language);
  }

  @Query(() => ZonePaginationResponse)
  async zones(
    @Language() language: string,
    @Args('filter', { nullable: true }) filter?: ZoneFilterInput,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<ZonePaginationResponse> {
    return this.zoneService.findAll(filter, language, page, limit);
  }

  @Query(() => ZoneType, { name: 'zone' })
  async zone(
    @Args('id', { type: () => ID }) id: string,
    @Language() language: string,
  ): Promise<Zone> {
    return this.zoneService.findById(id, language);
  }

  //   @Query(() => [ZoneType], { name: 'rootZones' })
  //   async findRootZones(): Promise<Zone[]> {
  //     return this.zoneService.findRootZones();
  //   }

  //   @Mutation(() => ZoneType)
  //   async updateZone(
  //     @Args('id', { type: () => ID }) id: string,
  //     @Args('updateZoneInput') updateZoneInput: CreateZoneInput,
  //   ): Promise<Zone> {
  //     return this.zoneService.update(id, updateZoneInput);
  //   }

  //   @Mutation(() => Boolean)
  //   async deleteZone(
  //     @Args('id', { type: () => ID }) id: string,
  //   ): Promise<boolean> {
  //     return this.zoneService.delete(id);
  //   }

  //   @ResolveField(() => [ZoneType], { nullable: 'items' })
  //   async children(@Parent() zone: ZoneDocument): Promise<Zone[]> {
  //     return this.zoneService.findChildren(zone._id.toString());
  //   }

  //   @ResolveField(() => ZoneType, { nullable: true })
  //   async parent(@Parent() zone: ZoneDocument): Promise<Zone | null> {
  //     if (!zone.parentId) return null;

  //     if (
  //       typeof zone.parentId === 'object' &&
  //       (('name' in zone?.parentId) as any)
  //     ) {
  //       return zone.parentId as Zone;
  //     }

  //     return this.zoneService.findById(zone.parentId.toString());
  //   }
}
