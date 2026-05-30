/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserInput } from './dto/user.input';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@schemas/user.schema';
import { Model, Types } from 'mongoose';
import { LoginUserInput } from 'src/auth/dto/login-user.input';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { ProfilesService } from '@components/profiles/profiles.service';
import { Profile } from '@schemas/profile.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  private readonly profilesService: ProfilesService) {}

  async create(loginUserInput: LoginUserInput): Promise<UserDocument> {
    try {
      const createdUser = await this.userModel.create({
        ...loginUserInput,
        password: bcrypt.hashSync(loginUserInput.password, 10),
      });
      const newProfile = new Profile();
      await this.profilesService.create(newProfile, createdUser._id);
      return createdUser;
    } catch (error) {
      console.error('Error during user creation:', error);
      throw new BadRequestException('algo salio mal');  // Lanza el error para que pueda ser capturado en la función signup
    }
  }

  async findAll(roles: ValidRoles[] ): Promise<UserDocument[]> {
    if (roles.length === 0) {
      const FoundUsers = await this.userModel.find().populate({path:'lastUpdatedById', select:'username'} ).exec();
      return FoundUsers; 
    } 
    return this.userModel.find({role: {$in: roles}}).populate({path:'lastUpdatedById', select:'username'}).exec();
  }

  async findOne(email: string): Promise<UserDocument> {
    console.log('user service', email);
    try {
      const user = await this.userModel.findOne({email}).exec();
      return user
    } catch (error) {
      throw new BadRequestException('algo salio mal');  // Lanza el error para que pueda ser capturado en la función signup
    }
  }

  async findOneById(id: string): Promise<UserDocument> {
    try {
      const objectId = new Types.ObjectId(id);
      const user = await this.userModel.findById(objectId).populate({path:'lastUpdatedById', select:'username'}).exec();
      return user
    } catch (error) {
      console.error('Error during user finding:', error);
      throw new NotFoundException(`${id} not found`);  // Lanza el error para que pueda ser capturado en la función signup
    }
  }

  async update(updateUserInput: UpdateUserInput, userUpdate: string): Promise<UserDocument> {
    const lastUpdatedById = new Types.ObjectId(userUpdate);
    try{

      const updateUser = await this.userModel.findByIdAndUpdate(
        updateUserInput._id,
        {
          ...updateUserInput,
          lastUpdatedById: lastUpdatedById},
        {new: true}
        ).populate({path:'lastUpdatedById', select:'username'}).exec();
      return updateUser;
    } catch (error) {
      throw new BadRequestException('algo salio mal');  // Lanza el error para que pueda ser capturado en la función signup
    }
  }

  async updateRole(email: string, role: string): Promise<UserDocument> {
    try {
      const validRoles = ['user', 'admin', 'superadmin', 'guest'];
      if (!validRoles.includes(role)) {
        throw new BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }

      const updatedUser = await this.userModel.findOneAndUpdate(
        { email },
        { $set: { role } },
        { new: true }
      ).exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      return updatedUser;
    } catch (error) {
      throw new BadRequestException(`Error updating role: ${error.message}`);
    }
  }

  async block(id: string, userUpdate: string): Promise<UserDocument> {
    const userToBlock = await this.userModel.findById(id).exec();
    userToBlock.isActive = false;
    userToBlock.lastUpdatedById = new Types.ObjectId(userUpdate);
    return userToBlock.save();
  }

  async findAdmins(): Promise<UserDocument[]> {
    try {
      const admins = await this.userModel.find({
        role: { $in: ['admin', 'superadmin'] }
      }).exec();
      return admins;
    } catch (error) {
      console.error('Error finding admins:', error);
      return [];
    }
  }
}
