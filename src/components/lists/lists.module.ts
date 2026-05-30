/* eslint-disable prettier/prettier */
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ListsService } from './lists.service';
import { ListsResolver } from './lists.resolver';
import { List, ListSchema } from '@schemas/list.schema';
import { Card, CardSchema } from '@schemas/card.schema';
import { CardsService } from '@components/cards/cards.service';
import { CardsModule } from '@components/cards/cards.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]),
    MongooseModule.forFeature([{ name: List.name, schema: ListSchema }]),
    forwardRef(() => CardsModule),
  ],
  providers: [ListsResolver, ListsService, CardsService],
})
export class ListsModule {}


