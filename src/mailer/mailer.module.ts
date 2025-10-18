import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailerService } from './mailer.service'; 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NestMailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        transport: {
          host: cfg.get<string>('MAIL_HOST'),
          port: cfg.get<number>('MAIL_PORT') ?? 1025,
          auth: cfg.get<string>('MAIL_USER')
            ? {
                user: cfg.get<string>('MAIL_USER'),
                pass: cfg.get<string>('MAIL_PASS'),
              }
            : undefined,
        },
        defaults: {
          from: cfg.get<string>('MAIL_FROM') ?? '"No-Reply" <no-reply@example.com>',
        },
        template: {
          dir: join(process.cwd(), 'src', 'mailer', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailModule {}  
