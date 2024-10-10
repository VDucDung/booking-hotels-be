import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ErrorHelper } from 'src/common/helpers';
import { LocalesService } from '../locales/locales.service';
import { CATEGORY_MESSAGE } from 'src/messages/category.message';
import { UploadService } from '../uploads/upload.service';
import { catetoryDefault } from 'src/constants/category.constants';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    private readonly localdesService: LocalesService,

    private readonly uploadService: UploadService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    file: File,
  ): Promise<Category> {
    const categoryExist = await this.getCategoryByName(createCategoryDto.name);
    if (categoryExist) {
      ErrorHelper.BadRequestException(
        this.localdesService.translate(CATEGORY_MESSAGE.CATEGORY_EXISTED),
      );
    }
    let url = catetoryDefault;
    if (file) {
      url = await this.uploadService.uploadImage(file);
    }
    createCategoryDto.image = url;
    const category = await this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      ErrorHelper.NotFoundException(
        this.localdesService.translate(CATEGORY_MESSAGE.CATEGORY_NOT_FOUND),
      );
    }
    return category;
  }

  async getCategoryByName(name: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ name });
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    file: File,
  ): Promise<Category> {
    const category = await this.findOne(id);
    let url = category.image;
    if (file) {
      url = await this.uploadService.uploadImage(file);
      updateCategoryDto.image = url;
    }
    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      return false;
    }
    return true;
  }
}