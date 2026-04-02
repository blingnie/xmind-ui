import toUrl from 'utils/to-url'
import { getCurrentLocale } from 'client/library/translation-helper'

export const formatDate = (date: string | number): string => {
  return new Intl.DateTimeFormat(getCurrentLocale(), { dateStyle: 'medium' }).format(new Date(date))
}

export const getCreditCardBrandIcon = (brand: string) => {
  switch (brand) {
    case 'Visa':
      return toUrl('/assets/static/images/dialog-payment/visa.svg')
    case 'MasterCard':
      return toUrl('/assets/static/images/dialog-payment/mastercard.svg')
    case 'American Express':
      return toUrl('/assets/static/images/dialog-payment/amex.svg')
    case 'UnionPay':
      return toUrl('/assets/static/images/dialog-payment/unionpay.svg')
    default:
      return toUrl('/assets/static/images/dialog-payment/default-card.svg')
  }
}
