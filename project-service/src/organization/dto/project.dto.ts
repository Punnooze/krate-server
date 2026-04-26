import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ProjectDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;
}