/* eslint-disable prettier/prettier */
import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ProfilesService } from './profiles.service';
import { Profile } from './entities/profile.entity';
import { CreateProfileInput, UpdateProfileInput } from './dto/profile.input';
//authenticacion y autorizacion
import { ValidRolesArgs } from '../../common/args/roles.args';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { User } from 'src/users/entities/user.entity';
import { Types } from 'mongoose';

@Resolver(() => Profile)
@UseGuards(JwtAuthGuard)
export class ProfilesResolver {
  constructor(private readonly profilesService: ProfilesService) {}

  @Mutation(() => Profile)
  createProfile(
    @Args('createProfileInput') createProfileInput: CreateProfileInput,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
  ): Promise<Profile> {
    return this.profilesService.create(createProfileInput, user._id);
  }

  @Query(() => [Profile], { name: 'profiles' })
  async findAll(
    @Args() validRoles: ValidRolesArgs,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
  ): Promise<Profile[]> {
    console.log('validRoles', validRoles, user);
    return this.profilesService.findAll(validRoles.roles);
  }

  @Query(() => Profile, { name: 'profile' })
  async findOne(
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin, ValidRoles.user])
    user: User,
  ): Promise<Profile> {
    const userId = user._id;
    const foundProfile = await this.profilesService.findOne(userId);
    // Si foundProfile es null, devuelve un nuevo objeto Profile con campos vacíos
    if (!foundProfile) {
      const newProfile = new Profile();
      newProfile.userId = new Types.ObjectId(userId);
      return newProfile;
    }
    return foundProfile;
  }

  @Mutation(() => Profile, { name: 'updateProfile' })
  updateProfile(
    @Args('updateProfileInput') updateProfileInput: UpdateProfileInput,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
  ) {
    console.log('updateProfileInput', updateProfileInput);
    return this.profilesService.update(updateProfileInput, user._id.toString());
  }

  @Mutation(() => Profile, { name: 'blockProfile' })
  removeProfile(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
  ): Promise<Profile> {
    return this.profilesService.remove(id, user._id.toString());
  }
}
