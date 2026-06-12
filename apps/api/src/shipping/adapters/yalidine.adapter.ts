import { Injectable, Logger } from '@nestjs/common'

export type ParcelInput = {
  orderNumber: string
  customerName: string
  customerPhone: string
  wilayaName: string
  communeName: string
  address: string
  productList: string
  amountDzd: number
  isStopdesk: boolean
  freeShipping?: boolean
}

export type ParcelResult = {
  provider: string
  trackingNumber: string
  label?: string
  raw: any
}

/**
 * محول Yalidine (يلدين).
 * التوثيق: https://developer.yalidine.app
 * اضبط: YALIDINE_API_ID, YALIDINE_API_TOKEN, YALIDINE_FROM_WILAYA
 */
@Injectable()
export class YalidineAdapter {
  private readonly logger = new Logger(YalidineAdapter.name)
  private readonly baseUrl = process.env.YALIDINE_BASE_URL || 'https://api.yalidine.app/v1'
  private readonly apiId = process.env.YALIDINE_API_ID || ''
  private readonly apiToken = process.env.YALIDINE_API_TOKEN || ''
  private readonly fromWilaya = process.env.YALIDINE_FROM_WILAYA || 'Alger'

  get isConfigured() {
    return Boolean(this.apiId && this.apiToken)
  }

  private headers() {
    return {
      'Content-Type': 'application/json',
      'X-API-ID': this.apiId,
      'X-API-TOKEN': this.apiToken,
    }
  }

  async createParcel(input: ParcelInput): Promise<ParcelResult> {
    if (!this.isConfigured) {
      this.logger.warn('Yalidine غير مضبوط — رقم تتبع تجريبي')
      return {
        provider: 'Yalidine',
        trackingNumber: 'YAL-' + input.orderNumber,
        raw: { sandbox: true },
      }
    }
    const body = [
      {
        order_id: input.orderNumber,
        firstname: input.customerName,
        familyname: '',
        contact_phone: input.customerPhone,
        from_wilaya_name: this.fromWilaya,
        to_wilaya_name: input.wilayaName,
        to_commune_name: input.communeName,
        address: input.address,
        product_list: input.productList,
        price: Math.round(input.amountDzd),
        is_stopdesk: input.isStopdesk,
        freeshipping: Boolean(input.freeShipping),
        do_insurance: false,
        has_exchange: false,
      },
    ]
    const res = await fetch(`${this.baseUrl}/parcels`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    })
    const data: any = await res.json()
    const entry = data?.[input.orderNumber] ?? Object.values(data || {})[0]
    if (!entry?.success) {
      throw new Error(`Yalidine error: ${entry?.message || JSON.stringify(data)}`)
    }
    return {
      provider: 'Yalidine',
      trackingNumber: entry.tracking,
      label: entry.label,
      raw: entry,
    }
  }

  async track(tracking: string): Promise<any> {
    if (!this.isConfigured || tracking.startsWith('YAL-')) {
      return { tracking, status: 'sandbox', history: [] }
    }
    const res = await fetch(`${this.baseUrl}/parcels/${tracking}`, { headers: this.headers() })
    return res.json()
  }
}
