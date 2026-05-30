/* eslint-disable prettier/prettier */
import { ObjectType, Field, HideField } from '@nestjs/graphql';
import { IsArray, IsEmail } from 'class-validator';
import { Types } from 'mongoose';
import { AbstractModel } from 'src/common/abstract.model';

@ObjectType()
export class User extends AbstractModel{

  @Field(() => String)
  username: string;

  @Field(() => String)
  @IsEmail()
  email: string;

  @HideField()
  password: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => [String])
  role: string[];

  @Field(() => UserPopulate, { nullable: true })
  lastUpdatedById?: Types.ObjectId;
}

@ObjectType()
export class UserPopulate {

  @Field(() => String)
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field(() => [String])
  @IsArray()
  role: string[];

}