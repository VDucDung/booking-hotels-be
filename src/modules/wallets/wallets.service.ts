import { Injectable } from '@nestjs/common';
import { ErrorHelper } from 'src/common/helpers';
import { TransactionStatus, TransactionType } from 'src/enums/transaction.enum';
import { USER_MESSAGE } from 'src/messages';
import { UserService } from 'src/modules/users/user.service';
import { TransactionService } from 'src/modules/transactions/transactions.service';

@Injectable()
export class WalletsService {
  constructor(
    private readonly userService: UserService,
    private readonly transactionService: TransactionService,
  ) {}

  async getWalletInfo(userId: number) {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      ErrorHelper.NotFoundException(USER_MESSAGE.USER_NOT_FOUND);
    }

    const latestTransactions = await this.transactionService.getTransactions(
      userId,
      {
        page: 1,
        limit: 5,
      },
    );

    const totalDeposited = await this.calculateTotalDeposited(userId);

    return {
      balance: user.balance,
      formattedBalance: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(user.balance),
      latestTransactions: latestTransactions.data,
      totalDeposited,
      formattedTotalDeposited: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(totalDeposited),
    };
  }

  async getTransactions(
    userId: number,
    query: { page: number; limit: number },
  ) {
    const transactions = await this.transactionService.getTransactions(
      userId,
      query,
    );

    // Format the transaction amounts
    const formattedTransactions = transactions.data.map((transaction) => ({
      ...transaction,
      formattedAmount: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(transaction.amount),
      statusText: this.getStatusText(transaction.status),
      typeText: this.getTypeText(transaction.type),
    }));

    return {
      data: formattedTransactions,
      total: transactions.total,
      page: transactions.page,
      limit: transactions.limit,
      totalPages: transactions.totalPages,
    };
  }

  private async calculateTotalDeposited(userId: number): Promise<number> {
    const allDeposits = await this.transactionService.getAllUserTransactions(
      userId,
      {
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.SUCCESS,
      },
    );

    return allDeposits.reduce(
      (total, transaction) => total + transaction.amount,
      0,
    );
  }

  private getStatusText(status: TransactionStatus): string {
    const statusMap = {
      [TransactionStatus.PENDING]: 'Đang xử lý',
      [TransactionStatus.SUCCESS]: 'Hoàn thành',
      [TransactionStatus.FAILED]: 'Thất bại',
    };
    return statusMap[status] || status;
  }

  private getTypeText(type: TransactionType): string {
    const typeMap = {
      [TransactionType.DEPOSIT]: 'Nạp tiền',
      [TransactionType.WITHDRAW]: 'Rút tiền',
      [TransactionType.PAYMENT]: 'Thanh toán',
      [TransactionType.REFUND]: 'Hoàn tiền',
    };
    return typeMap[type] || type;
  }
}
