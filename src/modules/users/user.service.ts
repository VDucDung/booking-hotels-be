import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { emailFormatter, ErrorHelper } from 'src/common/helpers';
import { USER_MESSAGE } from 'src/messages';
import { ERole } from 'src/enums/roles.enum';
import { LocalesService } from '../locales/locales.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { IPagination } from 'src/interfaces';
import { LIMIT_DEFAULT, PAGE_DEFAULT, SORT_DEFAULT } from 'src/constants';
import { ROLE_MESSAGE } from 'src/messages/role.message';
import { CommonHelper } from 'src/helpers/common.helper';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private localesService: LocalesService,
  ) {}

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    return user;
  }

  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(USER_MESSAGE.USER_NOT_FOUND),
      );
    }

    delete user.password;
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, fullname, password } = createUserDto;
    const normalizedEmail = emailFormatter(email);

    if (!email || !fullname || !password) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(USER_MESSAGE.CREATE_USER_FAIL),
      );
    }

    if (await this.isEmailTaken(normalizedEmail)) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(USER_MESSAGE.EMAIL_EXISTED),
      );
    }

    const lastUser = await this.userRepository.findOne({
      where: {
        role: {
          name: Not(ERole.ADMIN),
        },
      },
      order: { id: 'DESC' },
    });

    let noUser = lastUser ? +lastUser.username.replace('movieapp', '') : 0;

    let newUsername = `movieapp${noUser + 1}`;

    while (
      await this.userRepository.findOne({ where: { username: newUsername } })
    ) {
      noUser += 1;
      newUsername = `movieapp${noUser + 1}`;
    }

    if (!createUserDto.role || createUserDto.role.name === ERole.USER) {
      createUserDto['username'] = newUsername;
    }
    let role = await this.roleRepository.findOne({
      where: { name: ERole.USER },
    });

    if (!role) {
      role = await this.roleRepository.save({
        name: ERole.USER,
      });
    }

    createUserDto['normalizedEmail'] = normalizedEmail;
    const user = this.userRepository.create({
      ...createUserDto,
      role: role,
    });

    await this.userRepository.save(user);

    delete user.password;
    return user;
  }

  async updateUserById(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.getUserById(userId);

    if (
      updateUserDto.email &&
      (await this.isEmailTaken(updateUserDto.email, userId))
    ) {
      throw ErrorHelper.BadRequestException(
        this.localesService.translate(USER_MESSAGE.EMAIL_EXISTED),
      );
    }

    Object.entries(updateUserDto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        (user as any)[key] = value;
      }
    });

    await this.userRepository.save(user);

    delete user.password;

    return user;
  }

  async deleteUser(userId: number): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(USER_MESSAGE.USER_NOT_FOUND),
      );
    }
    await this.userRepository.delete(userId);
    return user;
  }

  async deleteMyAccount(userId: number): Promise<void> {
    const user = await this.getUserById(userId);

    if (!user) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(USER_MESSAGE.USER_NOT_FOUND),
      );
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const readyDelete = user.createdAt < thirtyDaysAgo;

    if (!readyDelete) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(USER_MESSAGE.DELETE_USER_FAIL),
      );
    }

    await this.userRepository.softDelete(user.id);
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    const { oldPassword, newPassword } = changePasswordDto;
    const user = await this.getUserById(userId);
    if (!(await user.isPasswordMatch(oldPassword))) {
      ErrorHelper.UnauthorizedException(
        this.localesService.translate(USER_MESSAGE.INVALID_PASSWORD),
      );
    }

    user.password = newPassword;
    await this.userRepository.save(user);

    delete user.password;
    return true;
  }

  async getUsers(query: GetUsersDto): Promise<IPagination<any>> {
    const { limit = LIMIT_DEFAULT, page = PAGE_DEFAULT, search, sort } = query;
    const offset = (page - 1) * limit;

    const role = await this.roleRepository.findOne({
      where: {
        name: ERole.ADMIN,
      },
    });
    if (!role) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(ROLE_MESSAGE.ROLE_NOT_FOUND),
      );
    }

    const searchQuery: any = {
      role: Not(role.id),
    };

    if (search) {
      searchQuery['where'] = [
        { email: ILike(`%${search}%`) },
        { firstName: ILike(`%${search}%`) },
        { lastName: ILike(`%${search}%`) },
      ];
    }
    const order = sort ? CommonHelper.handleSort(sort) : SORT_DEFAULT;
    const [items, total] = await this.userRepository.findAndCount({
      where: searchQuery,
      take: limit,
      skip: offset,
      order,
      relations: ['role'],
    });
    items.forEach((item) => {
      delete item.password;
    });
    return {
      page,
      limit,
      total,
      items,
    };
  }

  private async isEmailTaken(
    normalizedEmail: string,
    userId?: number,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { normalizedEmail },
    });
    return user ? user.id !== userId : false;
  }

  async findOne(args: any): Promise<User> {
    return this.userRepository.findOne(args);
  }
}