import { PartialType } from '@nestjs/mapped-types';
import { OrganizationDto } from './organization.dto';

export class UpdateOrganizationDto extends PartialType(OrganizationDto) {}