import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeUtility } from './entities/type_utility.entity';
import { TypeUtilityController } from './type_utility.controller';
import { TypeUtilityService } from './type_utility.service';
import { LocalesModule } from '../locales/locales.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from 'src/constants';
import { UserModule } from '../users/user.module';
import { HotelModule } from '../hotels/hotel.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeUtility]),
    LocalesModule,
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
    UserModule,
    HotelModule,
  ],
  controllers: [TypeUtilityController],
  providers: [TypeUtilityService],
  exports: [TypeUtilityService],
})
export class TypeUtilityModule {}
