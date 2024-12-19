import { AUTH_PROVIDER_MESSAGE, USER_MESSAGE } from 'src/messages';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthProvider } from './entities/auth_provider.entity';
import { CreateAuthProviderDto } from './dto/create-auth-provider.dto';
import { UpdateAuthProviderDto } from './dto/update-auth-provider.dto';
import { UserService } from '../users/user.service';
import { ErrorHelper } from 'src/common/helpers';
import { LocalesService } from '../locales/locales.service';

@Injectable()
export class AuthProviderService {
  constructor(
    @InjectRepository(AuthProvider)
    private authProviderRepository: Repository<AuthProvider>,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    @Inject(forwardRef(() => LocalesService))
    private readonly localesService: LocalesService,
  ) {}

  async create(
    createAuthProviderDto: CreateAuthProviderDto,
  ): Promise<AuthProvider> {
    const { userId, provider, providerId } = createAuthProviderDto;

    const user = await this.userService.getUserById(userId as number);

    const existingAuthProvider = await this.authProviderRepository.findOne({
      where: { provider, providerId },
    });

    if (existingAuthProvider) {
      return existingAuthProvider;
    }

    const authProvider = this.authProviderRepository.create({
      provider,
      providerId,
      user,
    });

    await this.authProviderRepository.save(authProvider);
    return authProvider;
  }

  async findAll(): Promise<AuthProvider[]> {
    return this.authProviderRepository.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<AuthProvider> {
    const authProvider = await this.authProviderRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!authProvider) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(
          AUTH_PROVIDER_MESSAGE.AUTH_PROVIDER_NOT_FOUND,
        ),
      );
    }
    return authProvider;
  }

  async update(
    id: string,
    updateAuthProviderDto: UpdateAuthProviderDto,
  ): Promise<AuthProvider> {
    const authProvider = await this.authProviderRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!authProvider) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(
          AUTH_PROVIDER_MESSAGE.AUTH_PROVIDER_NOT_FOUND,
        ),
      );
    }

    if (updateAuthProviderDto.userId) {
      const user = await this.userService.findOne({
        where: { id: updateAuthProviderDto.userId },
      });
      if (!user) {
        ErrorHelper.NotFoundException(
          this.localesService.translate(USER_MESSAGE.USER_NOT_FOUND),
        );
      }
      authProvider.user = user;
    }

    if (updateAuthProviderDto.provider) {
      authProvider.provider = updateAuthProviderDto.provider;
    }

    if (updateAuthProviderDto.providerId) {
      authProvider.providerId = updateAuthProviderDto.providerId;
    }

    return this.authProviderRepository.save(authProvider);
  }

  async remove(id: string): Promise<void> {
    const result = await this.authProviderRepository.delete(id);
    if (result.affected === 0) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(USER_MESSAGE.USER_NOT_FOUND),
      );
    }
  }
}
