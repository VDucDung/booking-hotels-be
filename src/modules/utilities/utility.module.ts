import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utility } from './entities/utility.entity';
import { UtilityController } from './utility.controller';
import { UtilityService } from './utility.service';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from 'src/constants';
import { LocalesModule } from '../locales/locales.module';
import { UserModule } from '../users/user.module';
import { TypeUtilityModule } from '../type_utility/type_utility.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Utility]),
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
    LocalesModule,
    UserModule,
    TypeUtilityModule,
  ],
  controllers: [UtilityController],
  providers: [UtilityService],
  exports: [UtilityService],
})
export class UtilityModule {}
