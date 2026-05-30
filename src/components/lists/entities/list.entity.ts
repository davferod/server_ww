/* eslint-disable prettier/prettier */
import { ObjectType, Field } from '@nestjs/graphql';
import { Types } from 'mongoose';

import { CardPopulate, Card } from '@components/cards/entities/card.entity';
import { Board } from '@components/boards/entities/board.entity';
import { AbstractModel } from 'src/common/abstract.model';


@ObjectType()
export class List extends AbstractModel {
  @Field()
  title: string;

  @Field(() => [Card], { nullable: true })
  cards?: Types.ObjectId[];

  @Field(() => Board)
  boardId: Types.ObjectId;

  @Field()
  position: number;

}
