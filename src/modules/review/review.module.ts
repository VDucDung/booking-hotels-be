import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewService } from './review.service';
import { Review } from './entities/review.entity';
import { LocalesModule } from '../locales/locales.module';
import { ReviewController } from './review.controller';
import { UploadModule } from '../uploads/upload.module';
import { UserModule } from '../users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from 'src/constants';
import { HotelModule } from '../hotels/hotel.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    LocalesModule,
    UploadModule,
    UserModule,
    HotelModule,
    UserModule,
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
  ],
  providers: [ReviewService],
  controllers: [ReviewController],
  exports: [ReviewService],
})
export class ReviewModule {}
