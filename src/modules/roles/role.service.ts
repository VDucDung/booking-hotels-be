import { Injectable } from '@nestjs/common';
import { LIMIT_DEFAULT, SORT_DEFAULT } from 'src/constants';
import { IPagination } from 'src/interfaces/response.interface';
import { LocalesService } from '../locales/locales.service';
import { CommonHelper } from 'src/helpers/common.helper';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';
import { ErrorHelper } from 'src/common/helpers';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, ILike, Like, FindOptionsOrder } from 'typeorm';
import { ROLE_MESSAGE } from 'src/messages/role.message';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GetRolesDto } from './dto/get-roles.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private localesService: LocalesService,
  ) {}

  async createRole(payload: CreateRoleDto): Promise<Role> {
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

    await this.roleRepository.update(roleId, {
      ...payload,
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
