import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CreateAuthProviderDto } from './dto/create-auth-provider.dto';
import { UpdateAuthProviderDto } from './dto/update-auth-provider.dto';
import { AuthProviderService } from './authProvider.service';
import { AuthProvider } from './entities/auth_provider.entity';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PermissionDecorator } from 'src/common/decorators/permission.decorator';
import { EUserPermission } from 'src/enums/roles.enum';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth-providers')
@ApiTags('auth-providers')
export class AuthProviderController {
  constructor(private readonly authProviderService: AuthProviderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @PermissionDecorator(EUserPermission.CREATE_AUTH_PROVIDER)
  create(
    @Body() createAuthProviderDto: CreateAuthProviderDto,
  ): Promise<AuthProvider> {
    return this.authProviderService.create(createAuthProviderDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @PermissionDecorator(EUserPermission.GET_AUTH_PROVIDERS)
  findAll(): Promise<AuthProvider[]> {
    return this.authProviderService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @PermissionDecorator(EUserPermission.GET_AUTH_PROVIDER)
  findOne(@Param('id') id: string): Promise<AuthProvider> {
    return this.authProviderService.findOne(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @PermissionDecorator(EUserPermission.UPDATE_AUTH_PROVIDER)
  update(
    @Param('id') id: string,
    @Body() updateAuthProviderDto: UpdateAuthProviderDto,
  ): Promise<AuthProvider> {
    return this.authProviderService.update(id, updateAuthProviderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @PermissionDecorator(EUserPermission.DELETE_AUTH_PROVIDER)
  async remove(@Param('id') id: string): Promise<void> {
    return this.authProviderService.remove(id);
  }
}
