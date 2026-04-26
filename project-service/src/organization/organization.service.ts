import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { OrganizationDto } from './dto/organization.dto';
import { PrismaService } from '../prisma.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { ProjectDto } from './dto/project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

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

    async inviteMember(userId: string, id: string, dto: InviteMemberDto) {
        const { isMemberAdminOrOwner } = await this.validateMembership(userId, id);
        if (isMemberAdminOrOwner) {
            const isUserAlreadyMember = await this.prismaService.organizationMember.findFirst({ where: { userId: dto.userId, organizationId: id } });
            if (isUserAlreadyMember == null) {
                return await this.prismaService.organizationMember.create({
                    data: { userId: dto.userId, organizationId: id, role: dto.role },
                });
            } else {
                throw new ConflictException('User is already a member of this organization');
            }
        } else {
            throw new ForbiddenException("This user cannot invite members");
        }
    }

    async getMembers(userId: string, id: string) {
        await this.validateMembership(userId, id);
        return await this.prismaService.organizationMember.findMany({ where: { organizationId: id } });
    }

    async updateMember(userId: string, id: string, memberId: string, dto: InviteMemberDto) {
        const { isMemberAdminOrOwner } = await this.validateMembership(userId, id);
        if (isMemberAdminOrOwner) {
            return await this.prismaService.organizationMember.update({
                where: {
                    userId_organizationId: {
                        userId: memberId,
                        organizationId: id,
                    },
                },
                data: dto,
            });
        } else {
            throw new ForbiddenException("This user cannot change user permissions");
        }
    }

    async deleteMember(userId: string, id: string, memberId: string) {
        const { isMemberAdminOrOwner } = await this.validateMembership(userId, id);
        if (isMemberAdminOrOwner) {
            return await this.prismaService.organizationMember.delete({
                where: {
                    userId_organizationId: {
                        userId: memberId,
                        organizationId: id,
                    },
                },
            });
        } else {
            throw new ForbiddenException("This user cannot delete another user");
        }
    }

    async createProject(userId: string, id: string, dto: ProjectDto) {
        await this.validateMembership(userId, id);
        return this.prismaService.project.create({
            data: {
                ownerId: userId,
                name: dto.name,
                organizationId: id
            }
        })
    }

    async getAllProjects(userId: string, id: string) {
        await this.validateMembership(userId, id);
        return await this.prismaService.project.findMany({ where: { organizationId: id } });
    }

    async getProject(userId: string, id: string, projectId: string) {
        await this.validateMembership(userId, id);
        const project = await this.prismaService.project.findUnique({ where: { organizationId: id, id: projectId } });
        if (project == null) {
            throw new NotFoundException("Project does not exist");
        }
        return project;
    }

    async updateProject(userId: string, id: string, projectId: string, dto: UpdateProjectDto) {
        await this.validateMembership(userId, id);
        const updatedProject = await this.prismaService.project.updateMany({
            where: { id: projectId, organizationId: id },
            data: {
                name: dto.name ?? undefined,
                description: dto.description === undefined ? undefined : dto.description,
            },
        });

        if (updatedProject.count === 0) {
            throw new NotFoundException("Project does not exist");
        }
        return updatedProject;
    }

    async deleteProject(userId: string, id: string, projectId: string) {
        const { isMemberAdminOrOwner } = await this.validateMembership(userId, id);
        if (isMemberAdminOrOwner) {
            const project = await this.prismaService.project.delete({
                where: { id: projectId, organizationId: id },
            });
            if (project == null) {
                throw new NotFoundException("This project does not exist");
            }
            return project;
        }
        else {
            throw new UnauthorizedException("User Does not have permission to delete this projet");
        }
    }

    private async validateMembership(userId: string, orgId: string) {
        const org = await this.prismaService.organization.findUnique({ where: { id: orgId } });
        if (!org) throw new NotFoundException('Organisation does not exist');

        const member = await this.prismaService.organizationMember.findFirst({
            where: { organizationId: orgId, userId }
        });
        if (!member) throw new ForbiddenException('User does not belong to this organization');

        const isMemberAdminOrOwner = member.role == "ADMIN" || member.role == "OWNER";

        return { org, member, isMemberAdminOrOwner };
    }
}

