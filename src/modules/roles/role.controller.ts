import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { AuthDecorator } from '../../common/decorators/auth.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { IPagination } from 'src/interfaces/response.interface';
import { LocalesService } from '../locales/locales.service';
import { RoleService } from './role.service';
import { PermissionDecorator } from '../../common/decorators/permission.decorator';
import { EUserPermission, ERole } from 'src/enums/roles.enum';
import { CreateRoleDto } from './dto/create-role.dto';
import { ROLE_MESSAGE } from 'src/messages/role.message';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GetRolesDto } from './dto/get-roles.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';

@ApiHeader({
  name: 'X-MyHeader',
  description: 'Custom header',
})
@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(
    @InjectRepository(Role)
    private readonly rolesService: RoleService,
    private readonly localesService: LocalesService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.CREATE_ROLE)
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<{
    message: string;
    data: Role;
  }> {
    return {
      message: this.localesService.translate(ROLE_MESSAGE.CREATE_ROLE_SUCCESS),
      data: await this.rolesService.createRole(createRoleDto),
    };
  }

  @Put(':roleId')
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.UPDATE_ROLE)
  async updateRole(
    @Param('roleId') roleId: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<{
    message: string;
    data: Role;
  }> {
    return {
      message: this.localesService.translate(ROLE_MESSAGE.UPDATE_ROLE_SUCCESS),
      data: await this.rolesService.updateRole(roleId, updateRoleDto),
    };
  }

  @Get(':roleId')
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.GET_ROLE)
  async getRole(@Param('roleId') roleId: number): Promise<Role> {
    return this.rolesService.getRole(roleId);
  }

  @Delete(':roleId')
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.DELETE_ROLE)
  async deleteRole(@Param('roleId') roleId: number): Promise<{
    message: string;
    data: Role;
  }> {
    return {
      message: this.localesService.translate(ROLE_MESSAGE.DELETE_ROLE_SUCCESS),
      data: await this.rolesService.deleteRole(roleId),
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.GET_ROLES)
  async getRoles(
    @Query() getRolesDto: GetRolesDto,
  ): Promise<IPagination<Role>> {
    return this.rolesService.getRoles(getRolesDto);
  }
}
