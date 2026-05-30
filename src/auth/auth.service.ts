/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';

import { LoginInput } from './dto';
import { User } from 'src/users/entities/user.entity';
import { LoginUserInput } from './dto/login-user.input';
import { LoginResponse } from './dto/login-response';


@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
        ) {}

    private getJwtToken(userId: string) {
        return this.jwtService.sign({ id: userId });
    }

    async validateUser(loginUserInput: LoginUserInput): Promise<any> {
        const { email, password } = loginUserInput;
        const user = await this.usersService.findOne(email);

        if (!user) {
            throw new BadRequestException('Invalid email or password');
        }

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            throw new BadRequestException('Invalid email or password');
        }

        const { password: userPassword, ...result } = user;
        return result;
    }

    async login(loginInput: LoginInput): Promise<LoginResponse> {
        const { email, password } = loginInput;
        const userFound = await this.usersService.findOne(email);
        if (!userFound) {
            throw new BadRequestException('Invalid email or password');
        }

        if (!bcrypt.compareSync(password, userFound.password)) {
            throw new BadRequestException('Invalid email or password');
        }

        try {
            const access_token = this.getJwtToken(userFound._id.toString());
            const refresh_token = this.getJwtToken(userFound.username.toString());
            return {
                accessToken: access_token,
                refreshToken: refresh_token,
                user: userFound,
            };
        } catch (error) {
            throw new Error('Error signing JWT token');
        }
    }

    async signup(loginUserInput: LoginUserInput): Promise<LoginResponse> {
        try {
            const createdUser = await this.usersService.create(loginUserInput);
            const user = createdUser;
            const accessToken = this.getJwtToken(user._id.toString());
            const refreshToken = this.getJwtToken(user.username.toString());
            return {accessToken , refreshToken, user };

        } catch (error) {
            console.error('Error during user creation:', error);
            throw new Error('Error creating user');
        }
    }

    async validateUserById(id: string): Promise<User> {
        const user = await this.usersService.findOneById(id);
        if (!user.isActive) {
            throw new UnauthorizedException('User is inactive, talk to the admin');
        }
        delete user.password;
        return user;
    }

    // true when the email can be used for a new signup
    async isAvailable(email_user: string): Promise<boolean> {
        const user = await this.usersService.findOne(email_user);
        return !user;
    }

    async revalidateToken(user: User): Promise<LoginResponse> {
        const accessToken = this.getJwtToken(user._id.toString());
        const refreshToken = this.getJwtToken(user.username.toString());
        return { accessToken, refreshToken, user };
    }

    // Bootstrap method: Promote user to admin if no admins exist yet
    async bootstrapAdmin(email: string): Promise<LoginResponse> {
        // Check if any admin or superadmin exists
        const adminExists = await this.usersService.findAdmins();
        
        if (adminExists.length > 0) {
            throw new BadRequestException('Admin users already exist. Cannot use bootstrap.');
        }

        // Find the user and promote to admin
        const user = await this.usersService.findOne(email);
        
        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Update the user role to admin
        const updatedUser = await this.usersService.updateRole(email, 'admin');

        if (!updatedUser) {
            throw new BadRequestException('Failed to promote user');
        }

        const accessToken = this.getJwtToken(updatedUser._id.toString());
        const refreshToken = this.getJwtToken(updatedUser.username.toString());
        
        return {
            accessToken,
            refreshToken,
            user: updatedUser,
        };
    }
}
