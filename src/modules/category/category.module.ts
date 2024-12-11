import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { JWT } from 'src/constants';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../users/user.module';
import { LocalesModule } from '../locales/locales.module';
import { UploadModule } from '../uploads/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
    LocalesModule,
    UserModule,
    UploadModule,
  ],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
