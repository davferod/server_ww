import { ObjectType, Int, Field, ID } from '@nestjs/graphql';
import { Types } from 'mongoose';

@ObjectType()
export class CardResponse {
  @Field(() => ID)
  _id?: Types.ObjectId;

  @Field(() => ID)
  listId: Types.ObjectId;

  @Field(() => Int)
  position?: number;

}