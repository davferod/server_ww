/* eslint-disable prettier/prettier */
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { LoginInput } from './dto';
import { AuthService } from './auth.service';
import { LoginResponse} from './dto/login-response';
import { SingupResponse } from './dto/singup-response';
import { LoginUserInput } from './dto/login-user.input';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from './decorators/current-user.decorator';

import { JwtAuthGuard } from './jwt-auth.guard';
/* import { GqlAuthGuard } from './gql-auth.guards'; */

@Resolver()
export class AuthResolver {
    constructor(private authService: AuthService) {}

    @Mutation(() => LoginResponse)
    login(
        @Args('loginInput') loginInput: LoginInput
        ): Promise<LoginResponse> {
            console.log('loginInput', loginInput);
        return this.authService.login(loginInput);
    }

    @Mutation(() => SingupResponse, { name: 'signup'})
    async signup(
        @Args('loginUserInput') loginUserInput: LoginUserInput): Promise<LoginResponse> {
        return this.authService.signup(loginUserInput);
    }

    @Query(() => LoginResponse, {name: 'revalidate'})
    @UseGuards(JwtAuthGuard)
    async revalidateToken(
        @CurrentUser(/* [ValidRoles.admin] */) user: User
    ): Promise<LoginResponse> {
        return this.authService.revalidateToken( user );
    }

    @Query(() => Boolean, {name: 'isValidate'})
    async isValidateEmail(
        @Args('email') email: string): Promise<boolean> {
        return this.authService.isAvailable( email );
    }

    @Mutation(() => LoginResponse, { name: 'bootstrapAdmin' })
    async bootstrapAdmin(
        @Args('email') email: string
    ): Promise<LoginResponse> {
        return this.authService.bootstrapAdmin(email);
    }

}
