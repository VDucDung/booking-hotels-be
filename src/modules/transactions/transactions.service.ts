import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { PaginationQuery } from 'src/interfaces/transaction.interface';
import { UserService } from 'src/modules/users/user.service';
import { TransactionStatus, TransactionType } from 'src/enums/transaction.enum';
import { ErrorHelper } from 'src/common/helpers';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async getTransactions(userId: number, query: PaginationQuery) {
    const page = query.page > 0 ? query.page : 1;
    const limit = query.limit > 0 ? query.limit : 10;

    const [transactions, total] =
      await this.transactionsRepository.findAndCount({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        take: limit,
        skip: (page - 1) * limit,
      });

    return {
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllUserTransactions(
    userId: number,
    filters: {
      type?: TransactionType;
      status?: TransactionStatus;
    },
  ) {
    const where: any = { userId };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return await this.transactionsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async createTransaction(data: {
    userId: number;
    amount: number;
    type: TransactionType;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
    ticketId?: string;
  }) {
    const transaction = this.transactionsRepository.create({
      ...data,
      status: TransactionStatus.PENDING,
    });

    return await this.transactionsRepository.save(transaction);
  }

  async updateTransactionStatus(
    stripeSessionId: string,
    status: TransactionStatus,
  ) {
    const transaction = await this.transactionsRepository.findOne({
      where: { stripeSessionId },
    });

    if (!transaction) {
      ErrorHelper.NotFoundException('Transaction not found');
    }

    transaction.status = status;
    return await this.transactionsRepository.save(transaction);
  }

  async updatePaymentTransactionStatus(
    stripePaymentIntentId: string,
    status: TransactionStatus,
  ) {
    const transaction = await this.transactionsRepository.findOne({
      where: { stripePaymentIntentId },
    });

    if (!transaction) {
      ErrorHelper.NotFoundException('Transaction not found');
    }

    transaction.status = status;
    return await this.transactionsRepository.save(transaction);
  }

  async handleSuccessfulPayment(session: any) {
    const transaction = await this.transactionsRepository.findOne({
      where: { stripeSessionId: session.id },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    transaction.status = TransactionStatus.SUCCESS;
    await this.transactionsRepository.save(transaction);

    const user = await this.userService.getUserById(transaction.userId);
    user.balance += transaction.amount;
    await this.userService.updateUserById(user.id, { balance: user.balance });

    return transaction;
  }
}
