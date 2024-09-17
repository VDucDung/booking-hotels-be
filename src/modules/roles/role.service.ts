import { Injectable } from '@nestjs/common';
import { LIMIT_DEFAULT, SORT_DEFAULT } from 'src/constants';
import { IPagination } from 'src/interfaces/response.interface';
import { PERMISSION_MESSAGE } from 'src/messages';
import { LocalesService } from '../locales/locales.service';
import { PermissionsService } from '../permissions/permissions.service';
import { CommonHelper } from 'src/helpers/common.helper';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';
import { ErrorHelper } from 'src/common/helpers';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, ILike, In, Like, FindOptionsOrder } from 'typeorm';
import { ROLE_MESSAGE } from 'src/messages/role.message';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GetRolesDto } from './dto/get-roles.dto';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private localesService: LocalesService,
    private permissionsService: PermissionsService,
  ) {}

  async createRole(payload: CreateRoleDto): Promise<Role> {
    const permissions = await this.permissionsService.findMany(
      payload.permissionIds,
    );

    if (permissions.length !== payload.permissionIds.length) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(
          PERMISSION_MESSAGE.PERMISSION_IDS_INVALID,
        ),
      );
    }

    const existingRole = await this.roleRepository.findOne({
      where: {
        name: payload.name,
      },
    });

    if (existingRole) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(ROLE_MESSAGE.ROLE_EXISTED),
      );
    }

    const role = this.roleRepository.create({
      ...payload,
    });

    return this.roleRepository.save(role);
  }

  async updateRole(roleId: number, payload: UpdateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: {
        id: Not(roleId),
        name: ILike(`%${payload.name}%`),
      },
    });

    if (existingRole) {
      throw new ErrorHelper.NotFoundException(
        this.localesService.translate(ROLE_MESSAGE.ROLE_EXISTED),
      );
    }

    const permissions = await this.permissionRepository.findBy({
      id: In(payload.permissionIds),
    });

    if (permissions.length !== payload.permissionIds.length) {
      throw new ErrorHelper.NotFoundException(
        this.localesService.translate(PERMISSION_MESSAGE.PERMISSION_NOT_FOUND),
      );
    }

    await this.roleRepository.update(roleId, {
      ...payload,
      permissionIds: permissions.map((permission) => permission.id),
    });

    const updatedRole = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!updatedRole) {
      throw new ErrorHelper.NotFoundException(
        this.localesService.translate(ROLE_MESSAGE.ROLE_NOT_FOUND),
      );
    }

    return updatedRole;
  }

  async getRole(roleId: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: {
        id: roleId,
      },
    });
    if (!role) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(ROLE_MESSAGE.ROLE_NOT_FOUND),
      );
    }
    return role;
  }

  async deleteRole(roleId: number): Promise<any> {
    const role = await this.roleRepository.findOne({
      where: {
        id: roleId,
      },
    });
    if (!role) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(ROLE_MESSAGE.ROLE_NOT_FOUND),
      );
    }
    return this.roleRepository.delete(roleId);
  }

  async getRoles(query: GetRolesDto): Promise<IPagination<Role>> {
    const { limit = LIMIT_DEFAULT, page = 1, sort, search } = query;
    const offset = (page - 1) * limit;

    const orderBy: FindOptionsOrder<Role> = sort
      ? CommonHelper.handleSort(sort)
      : SORT_DEFAULT;

    const searchQuery = search ? { name: Like(`%${search}%`) } : {};

    const [items, total] = await this.roleRepository.findAndCount({
      where: {
        ...searchQuery,
      },
      order: orderBy,
      skip: offset,
      take: limit,
    });

    return {
      page,
      limit,
      total,
      items,
    };
  }

  async findOne(args: any): Promise<Role> {
    return this.roleRepository.findOne(args);
  }

  async updateOne(args: any): Promise<any> {
    const { id, ...updateData } = args;
    return this.roleRepository.update(id, updateData);
  }
}
