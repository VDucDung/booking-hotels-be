import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Utility } from './entities/utility.entity';
import { CreateUtilityDto } from './dto/create-utility.dto';
import { UpdateUtilityDto } from './dto/update-utility.dto';
import { ErrorHelper } from 'src/common/helpers';
import { TypeUtilityService } from '../type_utility/type_utility.service';

@Injectable()
export class UtilityService {
  constructor(
    @InjectRepository(Utility)
    private readonly utilityRepository: Repository<Utility>,

    private readonly typeUtilityService: TypeUtilityService,
  ) {}

  async create(createUtilityDto: CreateUtilityDto): Promise<Utility> {
    const existingUtility = await this.findByName(createUtilityDto.name);
    if (existingUtility) {
      ErrorHelper.BadRequestException('Utility already exists');
    }

    const typeUtility = await this.typeUtilityService.findOne(
      createUtilityDto.typeUtilityId,
    );

    const newUtility = this.utilityRepository.create({
      name: createUtilityDto.name,
      typeUtility,
    });
    return this.utilityRepository.save(newUtility);
  }

  async findAll(): Promise<Utility[]> {
    return this.utilityRepository.find();
  }

  async findOne(id: number): Promise<Utility> {
    const utility = await this.utilityRepository.findOne({ where: { id } });
    if (!utility) {
      throw new NotFoundException('Utility not found');
    }
    return utility;
  }

  async findByName(name: string): Promise<Utility> {
    const utility = await this.utilityRepository.findOne({ where: { name } });
    return utility;
  }

  async update(
    id: number,
    updateUtilityDto: UpdateUtilityDto,
  ): Promise<Utility> {
    const utility = await this.findOne(id);
    Object.assign(utility, updateUtilityDto);
    return this.utilityRepository.save(utility);
  }

  async remove(id: number): Promise<void> {
    const utility = await this.findOne(id);
    await this.utilityRepository.remove(utility);
  }
}
