import {
  Controller,
  Body,
  Post,
  UseGuards,
  HttpStatus,
  Delete,
  Get,
  Request,
  Put,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpCode,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../uploads/options/multer.option';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

  @Get('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMe(
    @UserDecorator() user: User,
  ): Promise<{ statusCode: number; message: string; data: User }> {
    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(USER_MESSAGE.GET_ME_SUCCESS),
      data: await this.userService.getUserById(user.id),
    };
  }

  @Put('me')
  @ApiOperation({ summary: 'API Upload file to cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @PermissionDecorator(EUserPermission.UPDATE_USER)
  @UseInterceptors(FileInterceptor('file', multerOptions.fileFilter))
  async updateMe(
    @UserDecorator() user: any,
    @Body() updateUserDto: UpdateProfileDto,
    @UploadedFile() file,
  ): Promise<{ statusCode: number; message: string; data: User }> {
    const updatedUser = await this.userService.updateUserById(
      user.id,
      updateUserDto,
      file,
    );
    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(USER_MESSAGE.UPDATE_USER_SUCCESS),
      data: updatedUser,
    };
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
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
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @UserDecorator() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ statusCode: number; message: string }> {
    const updatedUser = await this.userService.changePassword(
      user.id,
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

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
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
  @HttpCode(HttpStatus.OK)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.GET_USERS)
  async getUsers(
    @Query() getUsersDto: GetUsersDto,
  ): Promise<IPagination<User>> {
    return this.userService.getUsers(getUsersDto);
  }

  @Get(':userId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.GET_USER)
  async getUser(@Param('userId') userId: number): Promise<User> {
    return this.userService.getUserById(userId);
  }

  @Put(':userId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.UPDATE_USER)
  @UseInterceptors(FileInterceptor('file', multerOptions.fileFilter))
  async updateUser(
    @Param('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file,
  ): Promise<{
    message: string;
    data: User;
  }> {
    return {
      message: this.localesService.translate(USER_MESSAGE.UPDATE_USER_SUCCESS),
      data: await this.userService.updateUserById(userId, updateUserDto, file),
    };
  }

  @Delete(':userId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
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

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post(':userId/lock')
  async lockUser(
    @Param('userId') userId: number,
  ): Promise<{ statusCode: number; message: string }> {
    const lockeduser = await this.userService.lockUserById(userId);
    if (!lockeduser) {
      ErrorHelper.AppErrorException(
        HttpStatus.BAD_REQUEST,
        this.localesService.translate(USER_MESSAGE.LOCKED_USER_FAIL),
      );
    }
    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(USER_MESSAGE.LOCKED_USER_SUCCESS),
    };
  }
}
