/* eslint-disable prettier/prettier */
import { InputType, Int, Field, ID, PartialType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { TaskInput } from '@components/tasks/dto/task.input';
import { UserInput } from 'src/users/dto/user.input';
import { RoutineInput } from '@components/routines/dto/routine.input';
import { AbstractModel } from 'src/common/abstract.model';

@InputType()
export class CardInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => Int)
  position: number;

  @Field(() => [TaskInput], { nullable: true })
  tasks?: Types.ObjectId[]; 

  @Field(() => [RoutineInput], { nullable: true })
  routines?: Types.ObjectId[];

  @Field(() => ID)
  userid?: Types.ObjectId;

}

@InputType()
export class CreateCardInput {
  @Field(() => ID)
  listId: Types.ObjectId;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => Int)
  position: number;

  @Field(()=> ID, { nullable: true })
  tasks?: Types.ObjectId[];

  @Field(() => ID, { nullable: true })
  routines?: Types.ObjectId[];

}

@InputType()
export class UpdateCardInput extends PartialType(CreateCardInput){
  @Field(() => ID)
  _id: Types.ObjectId;
}

@InputType()
export class RemoveCardInput {
  @Field(() => ID)
  _id: Types.ObjectId;
}

@InputType()
export class MoveCardToListInput {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field(() => ID)
  listIdOld: Types.ObjectId;

  @Field(() => ID)
  listIdNew: Types.ObjectId;

  @Field()
  position: number;
}

@InputType()
export class UpdateCardPositionInput {
  @Field(() => ID)
  _id: Types.ObjectId;
  
  @Field(() => ID)
  listId: Types.ObjectId;

  @Field(() => Int)
  position: number;
}

@InputType()
export class AddRoutineToCardInput {
  @Field(() => ID)
  cardId: Types.ObjectId;

  @Field(() => UserInput)
  routineId: Types.ObjectId;
}

@InputType()
export class RemoveRoutineFromCardInput {
  @Field(() => ID)
  cardId: Types.ObjectId;

  @Field(() => ID)
  routineId: Types.ObjectId;
}

@InputType()
export class AddTaskToCardInput {
  @Field(() => ID)
  cardId: Types.ObjectId;

  @Field(() => ID)
  taskId: Types.ObjectId;
}

@InputType()
export class RemoveTaskFromCardInput {
  @Field(() => ID)
  cardId: Types.ObjectId;

  @Field(() => ID)
  taskId: Types.ObjectId;
}

@InputType()
export class UpdateCardTitleInput {
  @Field(() => ID)
  cardId: string;

  @Field()
  title: string;
}

@InputType()
export class UpdateCardDescriptionInput {
  @Field(() => ID)
  cardId: string;

  @Field()
  description: string;
}

@InputType()
export class AddUserToCardInput {
  @Field(() => ID)
  cardId: Types.ObjectId;

  @Field(() => ID)
  userId: Types.ObjectId;
}

@InputType()
export class RemoveUserFromCardInput {
  @Field(() => ID)
  cardId: Types.ObjectId;

  @Field(() => ID)
  userId: Types.ObjectId;
}

@InputType()
export class AddCardToBoardInput {
  @Field(() => ID)
  boardId: Types.ObjectId;

  @Field(() => ID)
  cardId: Types.ObjectId;
}
