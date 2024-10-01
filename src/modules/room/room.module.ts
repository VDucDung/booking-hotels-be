import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { Room } from './entities/room.entity';
import { LocalesModule } from '../locales/locales.module';
import { UploadModule } from '../uploads/upload.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from 'src/constants';
import { PermissionsModule } from '../permissions/permissions.module';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room]),
    LocalesModule,
    UploadModule,
    PermissionsModule,
    LocalesModule,
    UserModule,
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
