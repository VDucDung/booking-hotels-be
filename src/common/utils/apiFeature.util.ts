import { LIMIT_DEFAULT, PAGE_DEFAULT, SORT_DEFAULT } from 'src/constants';
import { DetailResult, QueryParams } from 'src/interfaces';
import { Repository } from 'typeorm';

class ApiFeature<T> {
  private repository: Repository<T>;
  private tableName: string;

  constructor(repository: Repository<T>, tableName: string) {
    this.repository = repository;
    this.tableName = tableName;
  }

  async getResults(
    query: QueryParams,
    fieldsRegex: string[],
  ): Promise<{ results: T[]; detailResult: DetailResult }> {
    const {
      limit = LIMIT_DEFAULT,
      page = PAGE_DEFAULT,
      keyword = '',
      sortBy = SORT_DEFAULT,
      ...queryObj
    } = query;

    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder(this.tableName)
      .skip(skip)
      .take(limit);
    if (keyword) {
      qb.where(
        fieldsRegex.map((field) => `"${field}" ILIKE :keyword`).join(' OR '),
        { keyword: `%${keyword}%` },
      );
    }

    Object.keys(queryObj).forEach((key) => {
      qb.andWhere(`${key} = :${key}`, { [key]: queryObj[key] });
    });

    if (sortBy && typeof sortBy === 'string') {
      const sortFields = sortBy.split(',').map((sortItem) => {
        const [field, option = 'desc'] = sortItem.split(':');
        return `${field} ${option === 'desc' ? 'DESC' : 'ASC'}`;
      });

      sortFields.forEach((sortField) => {
        qb.addOrderBy(sortField);
      });
    }

    const [results, totalResult] = await qb.getManyAndCount();

    const detailResult: DetailResult = {
      limit: +limit,
      totalResult,
      totalPage: Math.ceil(totalResult / +limit),
      currentPage: +page,
      currentResult: results.length,
    };

    return { results, detailResult };
  }
}

export default ApiFeature;
