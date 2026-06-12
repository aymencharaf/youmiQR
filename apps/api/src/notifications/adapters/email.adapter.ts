import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

/**
 * محول البريد الإلكتروني عبر SMTP.
 * اضبط: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
@Injectable()
export class EmailAdapter {
  private readonly logger = new Logger(EmailAdapter.name)
  private transporter: nodemailer.Transporter | null = null

  private get from() {
    return process.env.SMTP_FROM || 'Youmi <no-reply@youmi.dz>'
  }

  get isConfigured() {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER)
  }

  private getTransporter() {
    if (this.transporter) return this.transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    return this.transporter
  }

  async send(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.isConfigured) {
      this.logger.log(`[EMAIL-SANDBOX] -> ${to}: ${subject}`)
      return true
    }
    try {
      await this.getTransporter().sendMail({ from: this.from, to, subject, html })
      return true
    } catch (e) {
      this.logger.error(`فشل إرسال البريد: ${(e as Error).message}`)
      return false
    }
  }
}
