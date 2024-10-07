import { All, Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @All('/health-check')
  healthCheck(@Res() res: Response): void {
    res.send({
      code: HttpStatus.OK,
      message: HttpStatus[HttpStatus.OK],
    });
  }
}
