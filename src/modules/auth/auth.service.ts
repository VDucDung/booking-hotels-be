import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../crypto/crypto.service';
import { EmailService } from '../email/email.service';
import {
  EMAIL_SUBJECT,
  EMAIL_TYPES,
  EXPIRES_TOKEN_EMAIL_VERIFY,
  nodeEnv,
  SECRET,
  TIME_DIFF_EMAIL_VERIFY,
  TOKEN_TYPES,
  tokenMappings,
  URL_HOST,
} from 'src/constants';
import { UserService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';
import { ErrorHelper } from 'src/common/helpers';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AUTH_MESSAGE, USER_MESSAGE } from 'src/messages';
import { LocalesService } from '../locales/locales.service';
import { ILogin } from 'src/interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    private readonly emailService: EmailService,
    private localesService: LocalesService,
  ) {}

  async login(loginDto: LoginDto): Promise<ILogin> {
    const { email, password } = loginDto;
    const user = await this.userService.getUserByEmail(email);

    if (!user || !(await user.isPasswordMatch(password))) {
      ErrorHelper.UnauthorizedException(
        this.localesService.translate(AUTH_MESSAGE.LOGIN_FAIL),
      );
    }

    if (!user.isVerify) {
      ErrorHelper.UnauthorizedException(
        this.localesService.translate(AUTH_MESSAGE.VERIFY),
      );
    }

    if (user.isLocked) {
      ErrorHelper.LockedExcetion(
        this.localesService.translate(USER_MESSAGE.LOCKED),
      );
    }

    const payload = { sub: user.id, email: user.email };
    user.lastActive = new Date();
    await this.userRepository.save(user);

    const accessToken = this.generateToken(TOKEN_TYPES.access, payload);
    const refreshToken = this.generateToken(TOKEN_TYPES.refresh, payload);

    user.password = undefined;

    return { user, accessToken, refreshToken };
  }

  async register(registerDto: RegisterDto): Promise<void> {
    const { fullname, email, password } = registerDto;
    const expires = new Date(Date.now() + EXPIRES_TOKEN_EMAIL_VERIFY);

    const registerData = {
      fullname,
      email,
      password,
      verifyExpireAt: expires,
    };

    await this.userService.createUser(registerData);

    const tokenVerify = this.cryptoService.encryptObj(
      { email, expires, type: EMAIL_TYPES.verify },
      SECRET.tokenVerify,
    );

    const linkVerify = `${URL_HOST.production_be}/auth/verify?token=${tokenVerify}`;

    await this.emailService.sendEmail({
      emails: email,
      subject: EMAIL_SUBJECT.verify,
      context: linkVerify,
      type: EMAIL_TYPES.verify,
    });
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    const { oldPassword, newPassword } = changePasswordDto;
    const user = await this.userService.getUserById(userId);

    if (!(await user.isPasswordMatch(oldPassword))) {
      ErrorHelper.UnauthorizedException('Invalid password');
    }

    user.password = newPassword;
    await this.userRepository.save(user);
    user.password = undefined;

    return user;
  }

  generateToken(type: string, payload: any): string {
    const { secret, expiresIn } = tokenMappings[type];
    return this.jwtService.sign({ ...payload, type }, { secret, expiresIn });
  }

  async verifyEmail(token: string): Promise<User> {
    const { isExpired, payload } = this.cryptoService.expiresCheck(
      token,
      SECRET.tokenVerify,
    );

    if (isExpired) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(AUTH_MESSAGE.TOKEN_INVALID),
      );
    }

    const user = await this.userService.getUserByEmail(payload.email);

    if (!user || user.isVerify) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(AUTH_MESSAGE.TOKEN_INVALID),
      );
    }

    user.isVerify = true;
    user.verifyExpireAt = null;
    await this.userRepository.save(user);
    user.password = undefined;

    return user;
  }

  async reSendEmailVerify(token: string): Promise<void> {
    const expires: Date = new Date(Date.now() + EXPIRES_TOKEN_EMAIL_VERIFY);

    const { isExpired, payload } = this.cryptoService.expiresCheck(
      token,
      SECRET.tokenVerify,
      TIME_DIFF_EMAIL_VERIFY,
    );

    if (!isExpired) {
      ErrorHelper.BadRequestException('Please wait a little longer');
    }

    const user = await this.userService.getUserByEmail(payload.email);
    if (user.isVerify) {
      ErrorHelper.BadRequestException('Email already verify');
    }

    const tokenVerify = this.cryptoService.encryptObj(
      {
        expires,
        email: user.email,
        type: EMAIL_TYPES.verify,
      },
      SECRET.tokenVerify,
    );

    const linkVerify = `${URL_HOST[nodeEnv]}/auth/verify?token=${tokenVerify}`;
    await this.emailService.sendEmail({
      emails: user.email,
      subject: EMAIL_SUBJECT.verify,
      context: linkVerify,
      type: EMAIL_TYPES.verify,
    });

    user.verifyExpireAt = expires;
    await this.userRepository.save(user);
  }
}
