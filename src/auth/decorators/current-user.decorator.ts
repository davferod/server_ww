/* eslint-disable prettier/prettier */
import { createParamDecorator, ExecutionContext, ForbiddenException, InternalServerErrorException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ValidRoles } from "../enums/valid-roles.enum";
import { User } from "src/users/entities/user.entity";


export const CurrentUser = createParamDecorator(
    (roles: ValidRoles[] = [], context: ExecutionContext ) => {

        const ctx = GqlExecutionContext.create(context);
        const user: User = ctx.getContext().req.user;
        if (!user) {
            throw new InternalServerErrorException('User not found - make sure that we used the AuthGuard');
        }

        if (roles.length === 0) return user;

        for (const role of user.role) {
            if (roles.includes( role as ValidRoles )) return user;
        }

        throw new ForbiddenException(`User ${user.username} need to have one of these roles: ${roles}`)
    })