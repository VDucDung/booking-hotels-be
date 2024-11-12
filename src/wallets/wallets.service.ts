import { Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/users/user.service';
import { TransactionService } from 'src/transactions/transactions.service';

@Injectable()
export class WalletsService {
  constructor(
    private readonly userServie: UserService,
    private readonly transactionService: TransactionService,
  ) {}

  async getWalletInfo(userId: number) {
    const user = await this.userServie.getUserById(userId);

    return {
      balance: user.balance,
      formattedBalance: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(user.balance),
    };
  }

  async getTransactions(
    userId: number,
    query: { page: number; limit: number },
  ) {
    const { data, total, page, limit, totalPages } =
      await this.transactionService.getTransactions(userId, query);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
