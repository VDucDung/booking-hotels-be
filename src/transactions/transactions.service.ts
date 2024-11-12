import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { PaginationQuery } from 'src/interfaces/transaction.interface';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
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
}
