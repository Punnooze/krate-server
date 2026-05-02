import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class CreateJobDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    cronSchedule!: string;

    @IsUrl()
    @IsNotEmpty()
    webhookUrl!: string;

    @IsString()
    @IsNotEmpty()
    projectId!: string;
}