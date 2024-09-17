import { Module } from '@nestjs/common';
import { LocalesService } from './locales.service';

@Module({
  providers: [LocalesService],
  exports: [LocalesService],
})
export class LocalesModule {}
