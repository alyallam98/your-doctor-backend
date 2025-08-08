import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { CreateUserInput } from './inputs/ceate-user.Input';
import { UserType } from './types/user.type';
import { UpdateUserInput } from './inputs/update-user.Input';

import { User } from './schemas/user.schema';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [UserType], { description: 'Get paginated users list' })
  async users() {
    return this.userService.getUsers();
  }

  @Query(() => UserType, { nullable: true, description: 'Get user by ID' })
  async user(@Args('id') id: string): Promise<User | null> {
    return this.userService.getUser(id);
  }

  @Mutation(() => UserType, { description: 'Create new user' })
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.userService.createUser(input);
  }

  @Mutation(() => UserType, { nullable: true, description: 'Update user' })
  async updateUser(
    @Args('input') input: UpdateUserInput,
    @Args('id') id: string,
  ): Promise<User | null> {
    return this.userService.updateUser(id, input);
  }
}
