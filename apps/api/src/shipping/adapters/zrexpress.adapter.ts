import { Injectable, Logger } from '@nestjs/common'
import type { ParcelInput, ParcelResult } from './yalidine.adapter'

/**
 * محول ZR Express (Procolis).
 * التوثيق: https://procolis.com (api_v1)
 * اضبط: ZR_EXPRESS_TOKEN, ZR_EXPRESS_KEY
 */
@Injectable()
export class ZrExpressAdapter {
  private readonly logger = new Logger(ZrExpressAdapter.name)
  private readonly baseUrl = process.env.ZR_EXPRESS_BASE_URL || 'https://procolis.com/api_v1'
  private readonly token = process.env.ZR_EXPRESS_TOKEN || ''
  private readonly key = process.env.ZR_EXPRESS_KEY || ''

  get isConfigured() {
    return Boolean(this.token && this.key)
  }

  private headers() {
    return { 'Content-Type': 'application/json', token: this.token, key: this.key }
  }

  async createParcel(input: ParcelInput, wilayaId: number): Promise<ParcelResult> {
    if (!this.isConfigured) {
      this.logger.warn('ZR Express غير مضبوط — رقم تتبع تجريبي')
      return {
        provider: 'ZRExpress',
        trackingNumber: 'ZR-' + input.orderNumber,
        raw: { sandbox: true },
      }
    }
    const body = {
      Colis: [
        {
          Tracking: input.orderNumber,
          TypeLivraison: input.isStopdesk ? '1' : '0', // 0=للمنزل 1=مكتب
          TypeColis: '0',
          Confrimee: '',
          Client: input.customerName,
          MobileA: input.customerPhone,
          MobileB: '',
          Adresse: input.address,
          IDWilaya: String(wilayaId),
          Commune: input.communeName,
          Total: String(Math.round(input.amountDzd)),
          Note: '',
          TProduit: input.productList,
          id_Externe: input.orderNumber,
          Source: '',
        },
      ],
    }
    const res = await fetch(`${this.baseUrl}/add_colis`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    })
    const data: any = await res.json()
    return {
      provider: 'ZRExpress',
      trackingNumber: input.orderNumber,
      raw: data,
    }
  }

  async track(tracking: string): Promise<any> {
    if (!this.isConfigured || tracking.startsWith('ZR-')) {
      return { tracking, status: 'sandbox', history: [] }
    }
    const res = await fetch(`${this.baseUrl}/lire`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ Colis: [{ Tracking: tracking }] }),
    })
    return res.json()
  }
}
