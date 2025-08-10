import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SpecializationService } from './specialization.service';
import { CreateSpecializationInput } from './inputs/create-specialization.input';
import { SpecializationType } from './types/specializationtype';
import { Language } from '../../common/decorators/language.decorator';

@Resolver()
export class SpecializationResolver {
  constructor(private readonly specializationService: SpecializationService) {}

  @Query(() => [SpecializationType])
  async specializations() {
    return this.specializationService.specializations();
  }
  @Query(() => SpecializationType, { nullable: true })
  async specialization(@Args('id') id: string) {
    return this.specializationService.specialization(id);
  }

  @Mutation(() => SpecializationType)
  async createSpecialization(
    @Args('input') input: CreateSpecializationInput,
    @Language() language: string,
  ) {
    return this.specializationService.createSpecialization(input, language);
  }
  @Mutation(() => SpecializationType, { nullable: true })
  async updateSpecialization(
    @Args('input') input: CreateSpecializationInput,
    @Args('id') id: string,
  ) {
    return this.specializationService.updateSpecialization(id, input);
  }
  @Mutation(() => Boolean)
  async deleteSpecialization(@Args('id') id: string) {
    return this.specializationService.deleteSpecialization(id);
  }
}
