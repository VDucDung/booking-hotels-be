import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { UtilityService } from './utility.service';
import { CreateUtilityDto } from './dto/create-utility.dto';
import { UpdateUtilityDto } from './dto/update-utility.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { ERole } from 'src/enums/roles.enum';

@Controller('utilities')
@ApiTags('utilities')
export class UtilityController {
  constructor(private readonly utilityService: UtilityService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  create(@Body() createUtilityDto: CreateUtilityDto) {
    console.log(createUtilityDto.typeUtilityId);

    return this.utilityService.create(createUtilityDto);
  }

  @Get()
  findAll() {
    return this.utilityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.utilityService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  update(@Param('id') id: number, @Body() updateUtilityDto: UpdateUtilityDto) {
    return this.utilityService.update(id, updateUtilityDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  remove(@Param('id') id: number) {
    return this.utilityService.remove(id);
  }
}
