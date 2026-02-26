// payment-intent.spec.ts

import { PaymentIntent, PaymentProvider } from './payment-intent.entity'
import { PaymentStatus } from './payment-intent-status.enum'

describe('PaymentIntent Domain', () => {
  it('should transition CREATED → PENDING → PAID', () => {
    const intent = PaymentIntent.create({
      id: '1',
      userId: 'u1',
      amount: 100,
      currency: 'BOB',
      billId: 'bill-1',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      provider: PaymentProvider.QR_BNB,
    })

    intent.activate()
    expect(intent.status).toBe(PaymentStatus.PENDING)

    intent.confirm()
    expect(intent.status).toBe(PaymentStatus.PAID)
  })

  it('should prevent invalid transition CREATED → PAID', () => {
    const intent = PaymentIntent.create({
      id: '1',
      userId: 'u1',
      amount: 100,
      currency: 'BOB',
      billId: 'bill-1',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      provider: PaymentProvider.QR_BNB,
    })

    expect(() => intent.confirm()).toThrow()
  })

  it('should be idempotent on confirm', () => {
    const intent = PaymentIntent.create({
      id: '1',
      userId: 'u1',
      amount: 100,
      currency: 'BOB',
      billId: 'bill-1',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      provider: PaymentProvider.QR_BNB,
    })

    intent.activate()
    intent.confirm()
    intent.confirm() // should not throw

    expect(intent.status).toBe(PaymentStatus.PAID)
  })
})

console.log('Test file loaded')

describe('Smoke test', () => {
  it('should run', () => {
    expect(1 + 1).toBe(2)
  })
})