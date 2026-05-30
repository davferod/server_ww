/* eslint-disable prettier/prettier */
import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { ListsService } from './lists.service';
import { List } from './entities/list.entity';
import { CreateListInput, UpdateListInput, RemoveListInput, UpdateListPositionInput } from './dto/list.input';
//authenticacion y autorizacion
import { ValidRolesArgs } from '../../common/args/roles.args';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { User } from 'src/users/entities/user.entity';
import { Types } from 'mongoose';

@Resolver(() => List)
@UseGuards(JwtAuthGuard)
export class ListsResolver {
  constructor(private readonly listsService: ListsService) {}

  @Mutation(() => List)
  async createList(
    @Args('createListInput') createListInput: CreateListInput,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
    ): Promise<List>{
    return this.listsService.create(createListInput, user._id);
  }

  @Query(() => [List], { name: 'lists' })
  async findAll(
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
  ): Promise<List[]> {
    console.log('validRoles', user);
    return this.listsService.findAll();
  }

  @Query(() => List, { name: 'list' })
  async findOne(
    @Args('id', { type: () => ID }) id: Types.ObjectId,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
    ) {
    return this.listsService.findOne(id);
  }

  @Query(() => List, { name: 'findOneByIdList' })
  async findOneById(
    @Args('id', { type: () => ID }) id: Types.ObjectId,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
    ) {
    console.log('user', user);
    return this.listsService.findOne(id);
  }

  @Query(() => [List], { name: 'findOneByBoard' })
  async findOneByBoard(
    @Args('boardId', { type: () => ID }) boardId: Types.ObjectId,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin, ValidRoles.user]) user: User,
    ): Promise<List[]> {
    boardId = new Types.ObjectId(boardId);
    console.log('resolve findOneByBoard', boardId);
    return this.listsService.findByBoard(boardId);
  }
  

  @Mutation(() => List, { name: 'updateListPosition' })
  async updateListPosition(
    @Args('updateListPositionInput') updateListPositionInput: UpdateListPositionInput,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
    ) {
    return this.listsService.updateListPosition(updateListPositionInput);
  }

  @Mutation(() => List)
  async updateList(
    @Args('updateListInput') updateListInput: UpdateListInput,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
    ): Promise<List> {
    return this.listsService.update(updateListInput);
  }

  @Mutation(() => List)
  async removeList(
    @Args('removeListInput') removeListInput: RemoveListInput,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
  ) {
    return this.listsService.remove(removeListInput);
  }
}
