import { Injectable, Logger } from '@nestjs/common'

/**
 * محول الدفع عبر SATIM (بطاقة CIB والذهبية EDAHABIA).
 * يستخدم بوابة SATIM e-payment (CIBWeb) عبر REST.
 *
 * تدفق الدفع:
 *  1) register.do  -> يعيد mdOrder + formUrl (نوجّه العميل إليه)
 *  2) العميل يدفع على صفحة SATIM
 *  3) confirmOrder.do -> التحقق من النتيجة عبر mdOrder
 *
 * اضبط المتغيرات في .env:
 *  SATIM_BASE_URL, SATIM_USERNAME, SATIM_PASSWORD, SATIM_TERMINAL_ID, SATIM_RETURN_URL, SATIM_FAIL_URL
 */
@Injectable()
export class SatimAdapter {
  private readonly logger = new Logger(SatimAdapter.name)
  private readonly baseUrl = process.env.SATIM_BASE_URL || 'https://cib.satim.dz/payment/rest'
  private readonly username = process.env.SATIM_USERNAME || ''
  private readonly password = process.env.SATIM_PASSWORD || ''
  private readonly terminalId = process.env.SATIM_TERMINAL_ID || ''

  get isConfigured() {
    return Boolean(this.username && this.password && this.terminalId)
  }

  /** تسجيل طلب دفع جديد. المبلغ بالدينار (سيُحوّل إلى سنتيم x100). */
  async registerOrder(params: {
    orderNumber: string
    amountDzd: number
    returnUrl: string
    failUrl?: string
  }): Promise<{ mdOrder: string; formUrl: string }> {
    if (!this.isConfigured) {
      // وضع المحاكاة (sandbox) عندما لا توجد مفاتيح
      this.logger.warn('SATIM غير مضبوط — إرجاع رابط محاكاة')
      return {
        mdOrder: 'SANDBOX-' + params.orderNumber,
        formUrl: `${params.returnUrl}?sandbox=1&orderNumber=${params.orderNumber}`,
      }
    }
    const query = new URLSearchParams({
      userName: this.username,
      password: this.password,
      orderNumber: params.orderNumber,
      amount: String(Math.round(params.amountDzd * 100)),
      currency: '012', // DZD ISO 4217
      returnUrl: params.returnUrl,
      failUrl: params.failUrl || params.returnUrl,
      language: 'ar',
    })
    const res = await fetch(`${this.baseUrl}/register.do?${query.toString()}`)
    const data: any = await res.json()
    if (data.errorCode && data.errorCode !== '0') {
      throw new Error(`SATIM register error ${data.errorCode}: ${data.errorMessage}`)
    }
    return { mdOrder: data.orderId, formUrl: data.formUrl }
  }

  /** تأكيد حالة الدفع بعد عودة العميل. */
  async confirmOrder(mdOrder: string): Promise<{ paid: boolean; raw: any }> {
    if (!this.isConfigured || mdOrder.startsWith('SANDBOX-')) {
      return { paid: true, raw: { sandbox: true } }
    }
    const query = new URLSearchParams({
      userName: this.username,
      password: this.password,
      orderId: mdOrder,
      language: 'ar',
    })
    const res = await fetch(`${this.baseUrl}/confirmOrder.do?${query.toString()}`)
    const data: any = await res.json()
    // orderStatus === 2 => تم الدفع بنجاح والإيداع مكتمل
    const paid = data.orderStatus === 2
    return { paid, raw: data }
  }
}
