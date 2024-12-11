import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewReply } from './entities/review_reply.entity';
import { ReviewReplyController } from './review_reply.controller';
import { ReviewReplyService } from './review_reply.service';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from 'src/constants';
import { LocalesModule } from '../locales/locales.module';
import { UserModule } from '../users/user.module';
import { ReviewModule } from '../review/review.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewReply]),
    UserModule,
    LocalesModule,
    ReviewModule,
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
  ],
  controllers: [ReviewReplyController],
  providers: [ReviewReplyService],
  exports: [ReviewReplyService],
})
export class ReviewReplyModule {}
