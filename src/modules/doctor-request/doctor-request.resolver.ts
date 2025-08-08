import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateDoctorRequestInput } from './inputs/create-doctor-request.input';
import { DoctorRequestService } from './doctor-request.service';
import { DoctorRequestType } from './types/doctor-request.type';
import { UpdateDoctorRequestInput } from './inputs/udpate-doctor-request.input';

@Resolver()
export class DoctorRequestResolver {
  constructor(private readonly doctorRequestService: DoctorRequestService) {}

  @Query(() => [DoctorRequestType])
  async doctorRequests() {
    return this.doctorRequestService.doctorRequests();
  }
  @Query(() => DoctorRequestType, { nullable: true })
  async doctorRequest(@Args('id') id: string) {
    return this.doctorRequestService.doctorRequest(id);
  }

  @Mutation(() => Boolean)
  async createDoctorRequest(@Args('input') input: CreateDoctorRequestInput) {
    return this.doctorRequestService.createDoctorRequest(input);
  }
  @Mutation(() => Boolean)
  async updateDoctorRequest(
    @Args('input') input: UpdateDoctorRequestInput,
    @Args('id') id: string,
  ) {
    return this.doctorRequestService.updateDoctorRequest(id, input);
  }
  @Mutation(() => Boolean)
  async deleteDoctorRequest(@Args('id') id: string) {
    return this.doctorRequestService.deleteDoctorRequest(id);
  }
}
