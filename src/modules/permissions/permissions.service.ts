import { Injectable } from '@nestjs/common';
import { PERMISSION_MESSAGE } from 'src/messages';
import { LocalesService } from '../locales/locales.service';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { ErrorHelper } from 'src/common/helpers';
import { createSlug, createUniqueSlug } from 'src/common/utils/slug.util';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private localesService: LocalesService,
  ) {}

  async createPermission(payload: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findOne({
      where: {
        name: payload.name,
      },
    });

    if (existingPermission) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(PERMISSION_MESSAGE.PERMISSION_EXISTED),
      );
    }

    if (!payload.slug) {
      const slug = createSlug(payload.name);
      const existingSlugs = await this.findAllSlugs();
      payload.slug = createUniqueSlug(slug, existingSlugs);
    }

    const permission = this.permissionRepository.create(payload);
    return this.permissionRepository.save(permission);
  }

  async updatePermission(
    permissionId: number,
    payload: UpdatePermissionDto,
  ): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findOne({
      where: {
        id: Not(permissionId),
        name: payload.name,
      },
    });

    if (existingPermission) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(PERMISSION_MESSAGE.PERMISSION_EXISTED),
      );
    }

    if (!payload.slug) {
      const slug = createSlug(payload.name);
      const existingSlugs = await this.findAllSlugs();
      payload.slug = createUniqueSlug(slug, existingSlugs);
    }

    await this.permissionRepository.update(permissionId, payload);
    return this.permissionRepository.findOne({ where: { id: permissionId } });
  }

  async getPermission(permissionId: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
    });

    if (!permission) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(PERMISSION_MESSAGE.PERMISSION_NOT_FOUND),
      );
    }

    return permission;
  }

  async deletePermission(permissionId: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
    });

    if (!permission) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(PERMISSION_MESSAGE.PERMISSION_NOT_FOUND),
      );
    }

    await this.permissionRepository.delete(permissionId);
    return permission;
  }

  async getPermissions(): Promise<Permission[]> {
    const permissions = await this.permissionRepository.find();
    const result = [];

    for (const permission of permissions) {
      const checkModule = result.findIndex(
        (item) => item.module === permission.module,
      );

      if (checkModule === -1) {
        result.push({
          module: permission.module,
          permissions: [permission],
        });
      } else {
        result[checkModule]['permissions'].push(permission);
      }
    }

    return result;
  }

  async findAllSlugs(): Promise<string[]> {
    const slugs = await this.permissionRepository.find({ select: ['slug'] });

    return slugs.map((permission) => permission.slug);
  }

  async findOne(args: any): Promise<Permission | undefined> {
    return this.permissionRepository.findOne(args);
  }

  async findMany(ids: number[]): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { id: In(ids) },
    });
  }

  async updateOne(args: any): Promise<Permission> {
    const { id, ...updateData } = args;
    await this.permissionRepository.update(id, updateData);
    return this.permissionRepository.findOne(id);
  }
}
