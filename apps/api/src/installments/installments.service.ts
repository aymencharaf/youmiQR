import { BadRequestException, Injectable } from '@nestjs/common'

export type InstallmentPlan = {
  months: number
  totalWithFees: number
  monthlyAmount: number
  feeRate: number
  schedule: Array<{ index: number; dueInDays: number; amount: number }>
}

/**
 * حاسبة البيع بالتقسيط (الأقساط).
 * رسوم تصاعدية حسب عدد الأشهر (قابلة للضبط عبر INSTALLMENT_FEE_*).
 */
@Injectable()
export class InstallmentsService {
  private readonly allowed = [3, 6, 12]

  private feeRateFor(months: number): number {
    const map: Record<number, number> = {
      3: Number(process.env.INSTALLMENT_FEE_3 || 0.03),
      6: Number(process.env.INSTALLMENT_FEE_6 || 0.06),
      12: Number(process.env.INSTALLMENT_FEE_12 || 0.12),
    }
    return map[months] ?? 0
  }

  /** خطط التقسيط المتاحة لمبلغ معيّن. */
  plansFor(amount: number): InstallmentPlan[] {
    if (amount <= 0) throw new BadRequestException('مبلغ غير صالح')
    return this.allowed.map((months) => this.buildPlan(amount, months))
  }

  buildPlan(amount: number, months: number): InstallmentPlan {
    if (!this.allowed.includes(months)) {
      throw new BadRequestException('عدد الأشهر غير مدعوم (3، 6، 12)')
    }
    const feeRate = this.feeRateFor(months)
    const totalWithFees = Math.round(amount * (1 + feeRate))
    const monthlyAmount = Math.round(totalWithFees / months)
    const schedule = Array.from({ length: months }, (_, i) => ({
      index: i + 1,
      dueInDays: (i + 1) * 30,
      // القسط الأخير يعالج فروق التقريب
      amount: i === months - 1 ? totalWithFees - monthlyAmount * (months - 1) : monthlyAmount,
    }))
    return { months, totalWithFees, monthlyAmount, feeRate, schedule }
  }
}
