/* eslint-disable prettier/prettier */
import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserInput, FindUserInput } from './dto/user.input';
import { UpdateUserRoleInput } from './dto/update-user-role.input';
//authenticacion y autorizacion
import { ValidRolesArgs } from './dto/args/roles.args';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';


@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  async findAll(
    @Args() validRoles: ValidRolesArgs,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User
  ): Promise<User[]> {
    return await this.usersService.findAll(validRoles.roles);
  }

  @Query(() => User, { name: 'user' })
  async findOne(
    @Args('findUserInput') findUserInput: FindUserInput,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User
  ): Promise<User>
    {
    const {username} = findUserInput;
    if (user.username !== username) {
      //TODO implementar que solo pueda ver su propio usuario si es un usuario normal
      //throw new Error('You are not allowed to see other users');
    }
    const foundUser = await this.usersService.findOne(username);
    return foundUser;
  }

  @Mutation(() => User)
  updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User) {
    return this.usersService.update(updateUserInput, user._id.toString());
  }

  @Mutation(() => User, {name: 'blockUser'})
  blockUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User
    ): Promise<User> {
    return this.usersService.block(id, user._id.toString());
  }

  @Mutation(() => User, { name: 'updateUserRole' })
  updateUserRole(
    @Args('updateUserRoleInput') updateUserRoleInput: UpdateUserRoleInput,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User
  ): Promise<User> {
    return this.usersService.updateRole(updateUserRoleInput.email, updateUserRoleInput.role);
  }
}
