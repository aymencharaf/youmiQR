import { Injectable, Logger } from '@nestjs/common'

/**
 * محول الرسائل القصيرة (SMS).
 * يدعم مزوّدي SMS الجزائريين عبر REST (مثل NetBeOpen / Twilio).
 * اضبط: SMS_API_URL, SMS_API_KEY, SMS_SENDER
 */
@Injectable()
export class SmsAdapter {
  private readonly logger = new Logger(SmsAdapter.name)
  private readonly apiUrl = process.env.SMS_API_URL || ''
  private readonly apiKey = process.env.SMS_API_KEY || ''
  private readonly sender = process.env.SMS_SENDER || 'YOUMI'

  get isConfigured() {
    return Boolean(this.apiUrl && this.apiKey)
  }

  async send(phone: string, message: string): Promise<boolean> {
    if (!this.isConfigured) {
      this.logger.log(`[SMS-SANDBOX] -> ${phone}: ${message}`)
      return true
    }
    try {
      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ to: phone, from: this.sender, text: message }),
      })
      return res.ok
    } catch (e) {
      this.logger.error(`فشل إرسال SMS: ${(e as Error).message}`)
      return false
    }
  }
}
