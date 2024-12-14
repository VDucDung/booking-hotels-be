import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ERole, EUserPermission } from 'src/enums/roles.enum';
import { PermissionDecorator } from 'src/common/decorators/permission.decorator';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { CATEGORY_MESSAGE } from 'src/messages/category.message';
import { LocalesService } from '../locales/locales.service';
import { ErrorHelper } from 'src/common/helpers';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../uploads/options/multer.option';
import { User } from '../users/entities/user.entity';
import { UserDecorator } from 'src/common/decorators/user.decorator';

@Controller('categories')
@ApiTags('categories')
@ApiBearerAuth()
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly localesService: LocalesService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.CREATE_CATEGORY)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerOptions.fileFilter))
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file,
    @UserDecorator() user: User,
  ): Promise<{ statusCode: number; message: string; data: Category }> {
    return {
      statusCode: HttpStatus.CREATED,
      message: this.localesService.translate(
        CATEGORY_MESSAGE.CREATE_CATEGORY_SUCCESS,
      ),
      data: await this.categoryService.create(createCategoryDto, file, user),
    };
  }

  @Get()
  async findAll(): Promise<{
    statusCode: number;
    message: string;
    data: Category[];
  }> {
    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(
        CATEGORY_MESSAGE.GET_CATEGORIES_SUCCESS,
      ),
      data: await this.categoryService.findAll(),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<{
    statusCode: number;
    message: string;
    data: Category;
  }> {
    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(
        CATEGORY_MESSAGE.GET_CATEGORY_SUCCESS,
      ),
      data: await this.categoryService.findOne(id),
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.UPDATE_CATEGORY)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerOptions.fileFilter))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file,
    @UserDecorator() user: User,
  ): Promise<{
    statusCode: number;
    message: string;
    data: Category;
  }> {
    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(
        CATEGORY_MESSAGE.UPDATE_CATEGORY_SUCCESS,
      ),
      data: await this.categoryService.update(
        id,
        updateCategoryDto,
        file,
        user,
      ),
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN])
  @PermissionDecorator(EUserPermission.DELETE_CATEGORY)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() user: User,
  ): Promise<{ statusCode: number; messsage: string }> {
    const category = await this.categoryService.remove(id, user);
    if (!category) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(CATEGORY_MESSAGE.DELETE_CATEGORY_FAIL),
      );
    }
    return {
      statusCode: HttpStatus.OK,
      messsage: this.localesService.translate(
        CATEGORY_MESSAGE.DELETE_CATEGORY_SUCCESS,
      ),
    };
  }
}
