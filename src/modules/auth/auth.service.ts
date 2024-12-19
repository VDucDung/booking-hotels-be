import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../crypto/crypto.service';
import { EmailService } from '../email/email.service';
import {
  EMAIL_SUBJECT,
  EMAIL_TYPES,
  EXPIRES_TOKEN_EMAIL_VERIFY,
  EXPIRES_TOKEN_FOTGOT_PASSWORD,
  EXPIRES_TOKEN_VERIFY_OTP_FORGOT,
  FULLNAME_DEFAULT,
  JWT,
  nodeEnv,
  SECRET,
  TIME_DIFF_EMAIL_VERIFY,
  TOKEN_TYPES,
  tokenMappings,
  URL_HOST,
  USER_AVATAR_DEFAULT,
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
import { AuthProviderService } from '../auth_provider/authProvider.service';
import { USER_FORGOT_STATUS_ENUM } from 'src/enums/user-forgot-status.enum';
import { generateOTP } from 'src/common/utils/generateOTP.util';
import { RoleService } from '../roles/role.service';

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
    private authProviderService: AuthProviderService,
    private roleService: RoleService,
  ) {}

  async login(loginDto: LoginDto): Promise<ILogin> {
    const { email, password } = loginDto;
    const user = await this.userService.findOne({
      where: { email },
      relations: ['authProviders', 'role'],
    });

    if (!user || !(await user.isPasswordMatch(password))) {
      ErrorHelper.UnauthorizedException(
        this.localesService.translate(AUTH_MESSAGE.LOGIN_FAIL),
      );
    }

    const authProvider = user.authProviders.find(
      (ap) => ap.provider === 'local',
    );
    if (!authProvider) {
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

  async validateOAuthLogin(
    email: string,
    provider: string,
    providerId: string,
    name?: string,
    avatar?: string,
  ): Promise<any> {
    const user = await this.userService.findOne({
      where: { email },
      relations: ['authProviders', 'role'],
    });
    if (user) {
      const existingProvider = user.authProviders.find(
        (ap) => ap.provider === provider && ap.providerId === providerId,
      );

      if (!existingProvider) {
        await this.authProviderService.create({
          provider,
          providerId,
          userId: user.id,
        });
      }
    } else {
      const roleUser = await this.roleService.findOne({
        where: { name: 'USER' },
      });
      const newUser = await this.userService.createUser({
        email,
        fullname: name ?? `${FULLNAME_DEFAULT}${new Date().getTime()}`,
        avatar: avatar ?? USER_AVATAR_DEFAULT,
        password: Math.floor(Math.random() * 100000).toString(),
        role: roleUser,
      });

      await this.authProviderService.create({
        provider,
        providerId,
        userId: newUser.id,
      });
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
    const roleUser = await this.roleService.findOne({
      where: { name: 'USER' },
    });

    const registerData = {
      fullname,
      email,
      password,
      role: roleUser,
      verifyExpireAt: expires,
    };

    const user = await this.userService.createUser(registerData);

    await this.authProviderService.create({
      provider: 'local',
      providerId: `${user.id}`,
      userId: user.id,
    });

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

  async registerPartner(registerDto: RegisterDto): Promise<void> {
    const { fullname, email, password } = registerDto;
    const expires = new Date(Date.now() + EXPIRES_TOKEN_EMAIL_VERIFY);
    const roleUser = await this.roleService.findOne({
      where: { name: 'PARTNER' },
    });

    const registerData = {
      fullname,
      email,
      password,
      role: roleUser,
      verifyExpireAt: expires,
    };

    const user = await this.userService.createUser(registerData);

    await this.authProviderService.create({
      provider: 'local',
      providerId: `${user.id}`,
      userId: user.id,
    });

    const tokenVerify = this.cryptoService.encryptObj(
      { email, expires, type: EMAIL_TYPES.verify },
      SECRET.tokenVerify,
    );

    const linkVerify = `${URL_HOST.production_be}/auth/verify?token=${tokenVerify}`;

    await this.emailService.sendEmail({
      emails: email,
      subject: EMAIL_SUBJECT.account,
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

  async forgotPassword(email: string): Promise<string> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(AUTH_MESSAGE.EMAIL_NOT_REGISTER),
      );
    }

    if (!user.isVerify) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(AUTH_MESSAGE.VERIFY),
      );
    }

    const expires = Date.now() + EXPIRES_TOKEN_FOTGOT_PASSWORD;
    const otp = generateOTP();

    const tokenForgot = this.cryptoService.encryptObj(
      {
        otp,
        email,
        expires,
        type: TOKEN_TYPES.forgot,
      },
      SECRET.tokenForgot,
    );

    await this.emailService.sendEmail({
      emails: email,
      subject: EMAIL_SUBJECT.forgot,
      context: otp,
      type: EMAIL_TYPES.forgot,
    });

    user.forgotStatus = USER_FORGOT_STATUS_ENUM.VERIFY_OTP;
    await this.userRepository.save(user);

    return tokenForgot;
  }

  async verifyOTPForgotPassword(token: string, otp: string): Promise<string> {
    const {
      isExpired,
      payload,
    }: {
      isExpired: boolean;
      payload: { email: string; otp: string; type: string };
    } = this.cryptoService.expiresCheck(token, SECRET.tokenForgot);

    if (isExpired) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(AUTH_MESSAGE.TOKEN_EXPIRED),
      );
    }

    if (payload.type !== TOKEN_TYPES.forgot) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(AUTH_MESSAGE.TOKEN_INVALID),
      );
    }

    if (payload.otp !== otp) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(AUTH_MESSAGE.VERIFY_OTP_INCORRECT),
      );
    }

    const user = await this.userService.getUserByEmail(payload.email);

    if (!user || user?.forgotStatus !== USER_FORGOT_STATUS_ENUM.VERIFY_OTP) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(AUTH_MESSAGE.TOKEN_INVALID),
      );
    }

    const expires = Date.now() + EXPIRES_TOKEN_VERIFY_OTP_FORGOT;

    const tokenVerifyOTP = this.cryptoService.encryptObj(
      {
        expires,
        email: user.email,
        type: TOKEN_TYPES.verify_otp,
      },
      SECRET.tokenVerifyOTP,
    );

    user.forgotStatus = USER_FORGOT_STATUS_ENUM.VERIFIED;
    await this.userRepository.save(user);

    return tokenVerifyOTP;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const {
      isExpired,
      payload,
    }: { isExpired: boolean; payload: { email: string; type: string } } =
      this.cryptoService.expiresCheck(token, SECRET.tokenVerifyOTP);

    if (isExpired) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(AUTH_MESSAGE.TOKEN_EXPIRED),
      );
    }

    if (payload.type !== TOKEN_TYPES.verify_otp) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(AUTH_MESSAGE.TOKEN_INVALID),
      );
    }

    const user = await this.userService.getUserByEmail(payload.email);

    if (!user || user.forgotStatus !== USER_FORGOT_STATUS_ENUM.VERIFIED) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(AUTH_MESSAGE.TOKEN_INVALID),
      );
    }

    user.password = newPassword;
    user.forgotStatus = USER_FORGOT_STATUS_ENUM.NULL;

    await this.userRepository.save(user);
  }

  async refreshToken(refressToken: string): Promise<{ accessToken: string }> {
    const payload = this.jwtService.verify(refressToken, {
      secret: JWT.secretRefresh,
    });

    if (!payload || payload.type !== TOKEN_TYPES.refresh) {
      ErrorHelper.BadRequestException(AUTH_MESSAGE.TOKEN_INVALID);
    }

    const user = await this.userService.getUserByEmail(payload.email);
    if (!user) {
      ErrorHelper.UnauthorizedException(AUTH_MESSAGE.TOKEN_INVALID);
    }

    if (user.isLocked) {
      ErrorHelper.UnauthorizedException(USER_MESSAGE.LOCKED);
    }

    const data = { id: user.id, email: user.email };
    const accessToken = this.generateToken(TOKEN_TYPES.access, data);

    return { accessToken };
  }
}
