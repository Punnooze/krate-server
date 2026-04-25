import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationDto } from './dto/organization.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrganizationService {
    constructor(private readonly prismaService: PrismaService) { }

    async create(dto: OrganizationDto, userId: string) {
        const existingOrganization = await this.prismaService.organization.findUnique({
            where: { slug: dto.slug },
        });

        if (existingOrganization) {
            throw new ConflictException("Already exists");
        }
        const organization = await this.prismaService.$transaction(async (tx) => {
            const org = await tx.organization.create({
                data: {
                    name: dto.name,
                    slug: dto.slug,
                    ownerId: userId,
                },
            });

            await tx.organizationMember.create({
                data: {
                    userId: userId,
                    organizationId: org.id,
                    role: 'OWNER',
                },
            });

            return org;
        });

        return organization;
    }

    async findAll(userId: string) {
        const memberships = await this.prismaService.organizationMember.findMany({ where: { userId: userId }, include: { organization: true } });
        return memberships.map(m => m.organization);
    }

    async findOne(userId: string, id: string) {
        const { org } = await this.validateMembership(userId, id);
        return org;
    }

    async update(userId: string, id: string, dto: OrganizationDto) {
        const { member } = await this.validateMembership(userId, id);
        if (member.role == "ADMIN" || member.role == "OWNER") {
            return await this.prismaService.organization.update({ where: { id: id }, data: dto });
        } else {
            throw new ForbiddenException("User cannot edit this organization");
        }
    }

    async delete(userId: string, id: string) {
        const { member } = await this.validateMembership(userId, id);
        if (member.role !== 'OWNER') {
            throw new ForbiddenException('Only owner can delete this organization');
        }

        await this.prismaService.$transaction(async (tx) => {
            await tx.organizationMember.deleteMany({
                where: { organizationId: id }
            });
            await tx.organization.delete({
                where: { id }
            });
        });

        return { message: 'Organization deleted successfully' };
    }

    private async validateMembership(userId: string, orgId: string) {
        const org = await this.prismaService.organization.findUnique({ where: { id: orgId } });
        if (!org) throw new NotFoundException('Organisation does not exist');

        const member = await this.prismaService.organizationMember.findFirst({
            where: { organizationId: orgId, userId }
        });
        if (!member) throw new ForbiddenException('User does not belong to this organization');

        return { org, member };
    }
}

