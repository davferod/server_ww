/* eslint-disable prettier/prettier */
import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { CardsService } from './cards.service';
import { Card } from './entities/card.entity';
import { CreateCardInput, UpdateCardInput, UpdateCardPositionInput } from './dto/card.input';
import { CardResponse } from './dto/card-response';
//authenticacion y autorizacion
import { ValidRolesArgs } from '../../common/args/roles.args';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { User } from 'src/users/entities/user.entity';
import { Types } from 'mongoose';

@Resolver(() => Card)
@UseGuards(JwtAuthGuard)
export class CardsResolver {
  constructor(private readonly cardsService: CardsService) {}

  @Mutation(() => Card)
  createCard(
    @Args('createCardInput') createCardInput: CreateCardInput,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,
    ) {
    return this.cardsService.create(createCardInput, user._id);
  }

  @Query(() => [Card], { name: 'cards' })
  findAll(
    @Args() validRoles: ValidRolesArgs,
    @CurrentUser([ValidRoles.admin, ValidRoles.superadmin]) user: User,): Promise<Card[]> {
    return this.cardsService.findAll();
  }

  @Query(() => Card, { name: 'card' })
  findOne(@Args('id', { type: () => Int }) id: Types.ObjectId) {
    return this.cardsService.findOne(id);
  }

  @Mutation(() => Card)
  updateCard(@Args('updateCardInput') updateCardInput: UpdateCardInput) {
    return this.cardsService.update(updateCardInput);
  }

  @Mutation(() => Card, { name: 'updateCardPosition' })
  updateCardPosition(
    @Args('CardPositionInput') CardPositionInput: UpdateCardPositionInput): Promise<CardResponse> {
    return this.cardsService.updateCardPosition(CardPositionInput);
  }

  @Mutation(() => Card)
  removeCard(@Args('id', { type: () => Int }) id: Types.ObjectId) {
    return this.cardsService.remove(id);
  }
}
