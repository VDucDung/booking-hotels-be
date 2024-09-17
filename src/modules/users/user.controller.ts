import {
  Controller,
  Body,
  Post,
  UseGuards,
  HttpStatus,
  Delete,
  Patch,
  Get,
  Request,
  Put,
  Param,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { LocalesService } from '../locales/locales.service';
import { UserService } from './user.service';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { PermissionDecorator } from 'src/common/decorators/permission.decorator';
import { EUserPermission, ERole } from 'src/enums/roles.enum';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { USER_MESSAGE } from 'src/messages';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { ErrorHelper } from 'src/common/helpers';
import { GetUsersDto } from './dto/get-users.dto';
import { IPagination } from 'src/interfaces';

@ApiHeader({
  name: 'X-MyHeader',
  description: 'Custom header',
})
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly localesService: LocalesService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.CREATE_USER)
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ statusCode: number; message: string; data: User }> {
    const data = await this.userService.createUser(createUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(USER_MESSAGE.CREATE_USER_SUCCESS),
      data,
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.GET_USERS)
  async getUsers(
    @Query() getUsersDto: GetUsersDto,
  ): Promise<IPagination<User>> {
    return this.userService.getUsers(getUsersDto);
  }

  @Get(':userId')
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.GET_USER)
  async getUser(@Param('userId') userId: number): Promise<User> {
    return this.userService.getUserById(userId);
  }

  @Put(':userId')
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.UPDATE_USER)
  async updateUser(
    @Param('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{
    message: string;
    data: User;
  }> {
    return {
      message: this.localesService.translate(USER_MESSAGE.UPDATE_USER_SUCCESS),
      data: await this.userService.updateUserById(userId, updateUserDto),
    };
  }

  @Delete(':userId')
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.DELETE_USER)
  async deleteUser(@Param('userId') userId: number): Promise<{
    message: string;
    data: User;
  }> {
    const user = await this.userService.deleteUser(userId);
    return {
      message: this.localesService.translate(USER_MESSAGE.DELETE_USER_SUCCESS),
      data: user,
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.USER, ERole.ADMIN])
  async getMe(
    @UserDecorator('id') userId: number,
  ): Promise<{ statusCode: number; message: string; data: User }> {
    const user = await this.userService.getUserById(userId);
    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(USER_MESSAGE.GET_ME_SUCCESS),
      data: user,
    };
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  async updateMe(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ statusCode: number; message: string; data: User }> {
    const updatedUser = await this.userService.updateUserById(
      req.user.id,
      updateUserDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(USER_MESSAGE.UPDATE_USER_SUCCESS),
      data: updatedUser,
    };
  }

  @UseGuards(AuthGuard)
  @Delete('me')
  async deleteMyAccount(
    @Request() user: any,
  ): Promise<{ statusCode: number; message: string }> {
    await this.userService.deleteMyAccount(user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Delete account successfully',
    };
  }

  @UseGuards(AuthGuard)
  @Post('change-password')
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ statusCode: number; message: string }> {
    const updatedUser = await this.userService.changePassword(
      req.user.id,
      changePasswordDto,
    );
    if (!updatedUser) {
      ErrorHelper.AppErrorException(
        HttpStatus.BAD_REQUEST,
        'Update password failed',
      );
    }
    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(USER_MESSAGE.UPDATE_USER_SUCCESS),
    };
  }
}