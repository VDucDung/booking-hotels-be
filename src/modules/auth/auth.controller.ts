import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ILogin } from 'src/interfaces';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';
import { LocalesService } from '../locales/locales.service';
import { AUTH_MESSAGE } from 'src/messages';
import { SECRET, URL_HOST } from 'src/constants';
import { CryptoService } from '../crypto/crypto.service';
import { UserService } from '../users/user.service';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly localesService: LocalesService,
    private readonly cryptoService: CryptoService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ statusCode: number; message: string; data: ILogin }> {
    const { user, accessToken, refreshToken } =
      await this.authService.login(loginDto);
    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(AUTH_MESSAGE.LOGIN_SUCCESS),
      data: { user, accessToken, refreshToken },
    };
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<{ statusCode: number; message: string }> {
    await this.authService.register(registerDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: this.localesService.translate(AUTH_MESSAGE.REGISTER_SUCCESS),
    };
  }

  @Get('verify')
  async renderPageVerifyEmail(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    let payload, isExpired;

    try {
      const originalToken = token.replaceAll(' ', '+');
      ({ payload, isExpired } = this.cryptoService.expiresCheck(
        originalToken,
        SECRET.tokenVerify,
      ));
    } catch {
      return res.redirect(`${URL_HOST.production}/not-found`);
    }

    const user = await this.userService.getUserByEmail(payload.email);

    if (user?.isVerify) {
      return res.redirect(`${URL_HOST.production}/auth/login`);
    }

    if (isExpired) {
      return res.render('pages/resend-verify-email');
    }

    res.render('pages/verify-email');
    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(AUTH_MESSAGE.VERIFY_SUCCESS),
    };
  }

  @Post('verify')
  async verifyEmail(
    @Query('token') token: string,
  ): Promise<{ statusCode: number; message: string }> {
    const originalToken = token.replace(/\s+/g, '+');
    await this.authService.verifyEmail(originalToken);
    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(AUTH_MESSAGE.VERIFY_SUCCESS),
    };
  }

  @Post('resend-email-verify')
  async reSendEmailVerify(
    @Query('token') token: string,
  ): Promise<{ statusCode: number; message: string }> {
    const originalToken = token.replace(/\s+/g, '+');
    await this.authService.reSendEmailVerify(originalToken);
    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(AUTH_MESSAGE.VERIFY_SUCCESS),
    };
  }
}
