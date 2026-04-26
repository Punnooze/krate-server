import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
    @IsOptional()
    @IsString()
    name?: string | null;

    @IsOptional()
    @IsString()
    description?: string | null;
}