import { Injectable } from '@nestjs/common';
import { MailerService as CoreMailer } from '@nestjs-modules/mailer';


@Injectable()
export class MailerService {
constructor(private mailer: CoreMailer) {}


async sendWelcome(to: string, name: string) {
return this.mailer.sendMail({
to,
subject: 'Welcome!',
template: 'welcome',
context: { name },
// Or just text/html:
// text: `Hello ${name}, welcome to our app!`,
});
}
}