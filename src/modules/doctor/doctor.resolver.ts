import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DoctorType } from './types/doctor.type';
import { DoctorService } from './doctor.service';
import { Doctor } from './schemas/doctor.schema';
import { CreateDoctorInput } from './inputs/create-doctor.Input';
import { UpdateDoctorInput } from './inputs/update-doctor.Input';

@Resolver()
export class DoctorResolver {
  constructor(private readonly doctorService: DoctorService) {}

  @Query(() => [DoctorType], { description: 'Get paginated users list' })
  async doctors() {
    return this.doctorService.getDoctors();
  }

  @Query(() => DoctorType, { nullable: true, description: 'Get user by ID' })
  async doctor(@Args('id') id: string): Promise<Doctor | null> {
    return this.doctorService.getDoctor(id);
  }

  @Mutation(() => DoctorType, { description: 'Create new user' })
  async createDoctor(@Args('input') input: CreateDoctorInput): Promise<Doctor> {
    return this.doctorService.createDoctor(input);
  }

  @Mutation(() => DoctorType, { nullable: true, description: 'Update user' })
  async updateDoctor(
    @Args('input') input: UpdateDoctorInput,
    @Args('id') id: string,
  ): Promise<Doctor | null> {
    return this.doctorService.updateDoctor(input, id);
  }
}
