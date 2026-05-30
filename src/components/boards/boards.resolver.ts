/* eslint-disable prettier/prettier */
import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BoardsService } from './boards.service';
import { Board } from './entities/board.entity';
import { CreateBoardInput, RemoveBoardInput, UpdateBoardInput } from './dto/board.input';
//authenticacion y autorizacion
import { ValidRolesArgs } from '../../common/args/roles.args';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { User } from 'src/users/entities/user.entity';
import { Types } from 'mongoose';

@Resolver(() => Board)
@UseGuards(JwtAuthGuard)
export class BoardsResolver {
  constructor(private readonly boardsService: BoardsService) {}

  @Mutation(() => Board, { name: 'createBoard' })
  async createBoard(
    @Args('createBoardInput') createBoardInput: CreateBoardInput,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
    ): Promise<Board> {
      return this.boardsService.create(createBoardInput, user._id);
  }

  @Query(() => [Board], { name: 'boards' })
  async findAll(
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
  ): Promise<Board[]> {
    return this.boardsService.findAll();
  }

  @Query(() => Board, { name: 'board' })
  async findOne(
    @Args('id', { type: () => ID }) id: Types.ObjectId,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin, ValidRoles.user]) user: User,
    ) {
    return this.boardsService.findOne(id);
  }

  @Query(() => Board, { name: 'findOneByIdBoard' })
  async findOneById(
    @Args('id', { type: () => ID }) id: Types.ObjectId,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin, ValidRoles.user]) user: User,
    ) {
    console.log('user', user);
    return this.boardsService.findOne(id);
  }

  @Query(() => Board, { name: 'findOneByUserBoard' })
  async findOneByUser(
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin, ValidRoles.user]) user: User,
    ) {
    return this.boardsService.findOneByUser(user._id);
  }

  @Mutation(() => Board)
  async updateBoard(
    @Args('updateBoardInput') updateBoardInput: UpdateBoardInput,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin, ValidRoles.user]) user: User,
    ) {
    return this.boardsService.update(updateBoardInput);
  }

  @Mutation(() => Board)
  async removeBoard(
    @Args('removeBoardInput') removeBoardInput: RemoveBoardInput,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
    ) {
    return this.boardsService.remove(removeBoardInput);
  }
}
