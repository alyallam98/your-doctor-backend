import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateDoctorRequestInput } from './inputs/create-doctor-request.input';
import { DoctorRequestService } from './doctor-request.service';
import { DoctorRequestType } from './types/doctor-request.type';
import { UpdateDoctorRequestInput } from './inputs/udpate-doctor-request.input';
import { UseGuards } from '@nestjs/common';
import { GqlThrottlerGuard } from '../../common/guards/GqlThrottlerGuard';
import { IsMongoId } from 'class-validator';
import { Language } from '../../common/decorators/language.decorator';
import { DoctorRequestsResponse } from './types/doctor.requests-response.type';

@Resolver()
export class DoctorRequestResolver {
  constructor(private readonly doctorRequestService: DoctorRequestService) {}

  @Query(() => DoctorRequestsResponse)
  async doctorRequests(
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 20,
    @Language() language: string,
  ) {
    return this.doctorRequestService.doctorRequests(page, limit, language);
  }

  @Query(() => DoctorRequestType, { nullable: true })
  async doctorRequest(@Args('id') id: string, @Language() language: string) {
    return this.doctorRequestService.doctorRequest(id, language);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlThrottlerGuard)
  async createDoctorRequest(@Args('input') input: CreateDoctorRequestInput) {
    return this.doctorRequestService.createDoctorRequest(input);
  }

  @Mutation(() => Boolean)
  async updateDoctorRequest(
    @Args('id')
    id: string,
    @Args('input') input: UpdateDoctorRequestInput,
  ) {
    return this.doctorRequestService.updateDoctorRequest(id, input);
  }
  @Mutation(() => Boolean)
  async deleteDoctorRequest(@Args('id') id: string) {
    return this.doctorRequestService.deleteDoctorRequest(id);
  }
}
