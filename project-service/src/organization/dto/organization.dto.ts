import { IsNotEmpty, IsString, Matches } from "class-validator";

export class OrganizationDto {
    @IsNotEmpty()
    @IsString()
    name! : string;

    @Matches(/^[a-z0-9-]+$/)
    @IsString()
    @IsNotEmpty()
    slug! : string;
}