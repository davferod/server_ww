/* eslint-disable prettier/prettier */
import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Types } from 'mongoose';

import { Routine } from '@components/routines/entities/routine.entity';
import { Task } from '@components/tasks/entities/task.entity';
import { AbstractModel } from 'src/common/abstract.model';

@ObjectType()
export class Card extends AbstractModel {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int , { nullable: true })
  position?: number;

  @Field(() => [Task], { nullable: true })
  tasks: Types.ObjectId[]; 

  @Field(() => [Routine], { nullable: true })
  routines: Types.ObjectId[];

  @Field(() => ID)
  userid?: Types.ObjectId;

  @Field(() => ID)
  listId: Types.ObjectId;
}

@ObjectType()
export class CardPopulate {
  @Field({ nullable: true })
  title?: string;

  @Field(() => Int , { nullable: true })
  position?: number;
}
