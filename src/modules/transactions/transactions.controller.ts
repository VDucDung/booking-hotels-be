import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { ERole } from 'src/enums/roles.enum';

@Controller('transactions')
@ApiTags('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(':userId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @AuthDecorator([ERole.ADMIN])
  async getUserTransactions(
    @Param('userId') userId: number,
    @Query() query: { page: number; limit: number },
  ) {
    return this.transactionService.getTransactions(userId, query);
  }
}
