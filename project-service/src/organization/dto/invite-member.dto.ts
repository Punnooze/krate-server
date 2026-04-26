import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export enum InviteRole {
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
    VIEWER = 'VIEWER'
}

export class InviteMemberDto {
    @IsNotEmpty()
    @IsString()
    userId!: string;

    @IsNotEmpty()
    @IsString()
    @IsEnum(InviteRole)
    role!: InviteRole;
}

