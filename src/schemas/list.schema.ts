/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import { Card } from './card.schema';

export type ListDocument = HydratedDocument<List>;

@Schema({ timestamps: true })
export class List {

  @Prop(String)
  title: string;

  @Prop()
  position: number;

  @Prop([{type: MongooseSchema.Types.ObjectId, ref: 'Card', index: true, sparse: true}])
  cards?: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Board', index: true })
  boardId: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

}

export const ListSchema = SchemaFactory.createForClass(List);
