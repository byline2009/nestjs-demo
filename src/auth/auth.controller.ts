import { Controller, Post, Get, Req, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  register(@Body() body: AuthDTO) {
    // register(@Body('email') email: string, @Body('password') password: string) {
    // console.log(`email = ${email}, password = ${password}`);
    return this.authService.register();
  }

  @Post('login')
  login() {
    return this.authService.login();
  }
}
