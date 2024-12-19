import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpStatus,
  Res,
  HttpCode,
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
import { LoginWithGoogleDto } from './dto/login-with-google.dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyOTPForgotPasswordDto,
} from './dto/forgot-password.dto';

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
  @HttpCode(HttpStatus.OK)
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

  @Post('google/login')
  @HttpCode(HttpStatus.OK)
  async loginWithGoogle(
    @Body() loginWithGoogleDto: LoginWithGoogleDto,
  ): Promise<{ statusCode: number; message: string; data: ILogin }> {
    const { user, accessToken, refreshToken } =
      await this.authService.validateOAuthLogin(
        loginWithGoogleDto.email,
        loginWithGoogleDto.provider,
        loginWithGoogleDto.providerId,
        loginWithGoogleDto.name,
        loginWithGoogleDto.avatar,
      );
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

  @Post('register-partner')
  async registerPartner(
    @Body() registerDto: RegisterDto,
  ): Promise<{ statusCode: number; message: string }> {
    await this.authService.registerPartner(registerDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: this.localesService.translate(AUTH_MESSAGE.REGISTER_SUCCESS),
    };
  }

  @Get('verify')
  @HttpCode(HttpStatus.OK)
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
      return res.redirect(`${URL_HOST.production_fe}/not-found`);
    }

    const user = await this.userService.getUserByEmail(payload.email);

    if (user?.isVerify) {
      return res.redirect(`${URL_HOST.production_fe}/auth/login`);
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ statusCode: number; message: string; data: string }> {
    const tokenVerifyOTP = await this.authService.forgotPassword(
      forgotPasswordDto.email,
    );

    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(
        AUTH_MESSAGE.FORGOT_PASSWORD_SUCCESS,
      ),
      data: tokenVerifyOTP,
    };
  }

  @Post('verify-otp-forgot-password')
  @HttpCode(HttpStatus.OK)
  async verifyOTPForgotPassword(
    @Body() verifyOTPForgotPasswordDto: VerifyOTPForgotPasswordDto,
  ): Promise<{ statusCode: number; message: string; data: string }> {
    const tokenVerifyOTP = await this.authService.verifyOTPForgotPassword(
      verifyOTPForgotPasswordDto.token,
      verifyOTPForgotPasswordDto.otp,
    );

    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(AUTH_MESSAGE.VERIFY_OTP_SUCCESS),
      data: tokenVerifyOTP,
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ statusCode: number; message: string }> {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(
        AUTH_MESSAGE.RESET_PASSWORD_SUCCESS,
      ),
    };
  }

  @Post('refresh-tokens')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<{ statusCode: number; message: string; data: string }> {
    const { accessToken } = await this.authService.refreshToken(refreshToken);

    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(AUTH_MESSAGE.REFRESH_TOKEN),
      data: accessToken,
    };
  }
}
