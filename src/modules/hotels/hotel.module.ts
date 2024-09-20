import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { Hotel } from './entities/hotel.entity';
import { LocalesModule } from '../locales/locales.module';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel]), LocalesModule],
  controllers: [HotelController],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule {}
