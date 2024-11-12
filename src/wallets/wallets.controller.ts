import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { WalletsService } from './wallets.service';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationQuery } from 'src/interfaces/transaction.interface';

@ApiTags('wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getWalletInfo(@UserDecorator() user: User) {
    return this.walletsService.getWalletInfo(user.id);
  }

  @Get('transactions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getTransactions(
    @UserDecorator() user: User,
    @Query() query: PaginationQuery,
  ) {
    return this.walletsService.getTransactions(user.id, query);
  }
}
