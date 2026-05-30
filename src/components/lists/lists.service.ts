/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { List, ListDocument } from '@schemas/list.schema';
import { CreateListInput, UpdateListInput, RemoveListInput, UpdateListPositionInput } from './dto/list.input';

@Injectable()
export class ListsService {
  constructor(@InjectModel(List.name) private readonly ListModel: Model<ListDocument>) {}

  async createFromBoard(_boardId: Types.ObjectId): Promise<ListDocument[]> {
    try {
      const createListInputs = [
        {title: 'To Do', boardId: _boardId, position: 1},
        {title: 'Done', boardId: _boardId, position: 2},
      ];
      const createdList = await this.ListModel.insertMany(
        createListInputs
      );
      return createdList;
    } catch (error) {
      console.error('Error during user creation:', error);
      throw new BadRequestException('algo salio mal');  // Lanza el error para que pueda ser capturado en la función signup
    }
  }

  async create(createListInput: CreateListInput, _userId: Types.ObjectId): Promise<ListDocument> {
    try {
      const createdList = await this.ListModel.create({
        ...createListInput,
        userId: _userId
      });
      return createdList;
    } catch (error) {
      console.error('Error during user creation:', error);
      throw new BadRequestException('algo salio mal');  // Lanza el error para que pueda ser capturado en la función signup
    }
  }

  async findAll(): Promise<ListDocument[]> {
    return this.ListModel.find().exec();
  }

  async findOne(id: Types.ObjectId): Promise<ListDocument> {
    try {
      return this.ListModel.findOne({_id: id}).exec();
    } catch (error) {
      console.error('Error during user finding:', error);
      throw new NotFoundException(`${id} not found`);  // Lanza el error para que pueda ser capturado en la función signup
    }
  }

  async findByID(id: Types.ObjectId): Promise<ListDocument> {
    try {
      return this.ListModel.findById(id).exec();
    } catch (error) {
      console.error('Error during user finding:', error);
      throw new NotFoundException(`${id} not found`);  // Lanza el error para que pueda ser capturado en la función signup
    }
  }

  async findOneByUser(userId: Types.ObjectId): Promise<ListDocument[]> {
    try {
      return this.ListModel.find({userId: userId}).exec();
    } catch (error) {
      console.error('Error during user finding:', error);
      throw new NotFoundException(`${userId} not found`);  // Lanza el error para que pueda ser capturado en la función signup
    }
  }

  async findByBoard(boardId: Types.ObjectId): Promise<ListDocument[]> {
    try {
      const lists = await this.ListModel.find({boardId})
      .populate({
        path:'cards',
        select: 'title description position createdAt updatedAt',
      }).exec()
      console.log('Listas con cards populados:', JSON.stringify(lists, null, 2));
      return lists;
    } catch (error) {
      console.error('Error during user finding:', error);
      throw new NotFoundException(`${boardId} not found`);  // Lanza el error para que pueda ser capturado en la función signup
    }
  }

  async updateListPosition(updateListPositionInput: UpdateListPositionInput): Promise<ListDocument> {
    try {
      const updatedList = await this.ListModel.findByIdAndUpdate(
        updateListPositionInput.listId,
        {
          position: updateListPositionInput.position
        },
        { new: true }
      ).exec();
      return updatedList;
    } catch (error) {
      console.error('Error during user updating:', error);
      throw new NotFoundException(`${updateListPositionInput.listId} not found`);  // Lanza el error para que pueda ser capturado en la función signup
    }
  }

  async update(updateListInput: UpdateListInput): Promise<ListDocument> {
    try{
      const updatedList = await this.ListModel.findByIdAndUpdate(
        updateListInput._id,
        {
          ...updateListInput
        },
        { new: true }
      ).exec();
      return updatedList;
    } catch (error) {
      console.error('Error during user updating:', error);
      throw new NotFoundException(`${updateListInput._id} not found`);  // Lanza el error para que pueda ser capturado en la función signup
    }
  }

  async remove(removeListInput: RemoveListInput): Promise<ListDocument> {
    try {
      return this.ListModel.findByIdAndDelete(removeListInput._id).exec();
    } catch (error) {
      console.error('Error during user removing:', error);
      throw new NotFoundException(`${removeListInput._id} not found`);  // Lanza el error para que pueda ser capturado en la función signup
    }
  }

  async addCard(ListId: Types.ObjectId, cardId: Types.ObjectId): Promise<ListDocument> {
    try {
      const list = await this.ListModel.findByIdAndUpdate(
        ListId,
        { $push: { cards: cardId } },
        { new: true }
      ).exec();
      if (!list) {
        throw new NotFoundException(`${ListId} not found`);
      }
      return list;
    } catch (error) {
      console.error('Error during user removing:', error);
      throw new NotFoundException(`${ListId} not found`);  // Lanza el error para que pueda ser capturado en la función signup
    }
  }

  async deleteCard(ListId: Types.ObjectId, cardId: Types.ObjectId): Promise<ListDocument> {
    try {
      const list = await this.ListModel.findByIdAndUpdate(
        ListId,
        { $pull: { cards: cardId } },
        { new: true }
      ).exec();
      if (!list) {
        throw new NotFoundException(`${ListId} not found`);
      }
/*       // Filtrar el arreglo de cards para excluir el cardId que deseas eliminar
      list.cards = list.cards.filter(card => !card.equals(cardId));
      await list.save(); */
      return list;
    } catch (error) {
      console.error('Error during user removing:', error);
      throw new NotFoundException(`${ListId} not found`);  // Lanza el error para que pueda ser capturado en la función signup
    }
  }
}
