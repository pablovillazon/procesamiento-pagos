import { PaymentStatus } from './payment-intent-status.enum'
import {
  InvalidStatusTransitionError,
  PaymentAlreadyFinalizedError,
} from './payment-intent.errors'

export interface PaymentIntentProps {
  id: string
  userId: string
  billId: string
  amount: number
  currency: string
  description?: string
  status: PaymentStatus
  expiresAt: Date
  externalReference?: string
  provider: PaymentProvider
  confirmedAt?: Date
  createdAt: Date
  updatedAt?: Date
}

export enum PaymentProvider {
    QR_BNB = 'QR_BNB',
    QR_BCP = 'QR_BCP',
    QR_SIMPLE = 'QR_SIMPLE',
}

export class PaymentIntent {
  private props: PaymentIntentProps

  private constructor(props: PaymentIntentProps) {
    this.props = props
    }

  // 🔹 Factory method
  static create(props: Omit<PaymentIntentProps, 'status' | 'createdAt'>) {
    return new PaymentIntent({
      ...props,
      status: PaymentStatus.CREATED,
      createdAt: new Date(),
    })
  }

    // 🔹 Usage example
    static createExample(): PaymentIntent {
      return PaymentIntent.create({
        id: 'pi_123',
        userId: 'user_456',
        billId: 'bill_789',
        amount: 100.50,
        currency: 'USD',
        description: 'Payment for services',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        provider: PaymentProvider.QR_BNB,
      })
    }

  // 🔹 Rehydrate from persistence
  static fromPersistence(props: PaymentIntentProps) {
    return new PaymentIntent(props)
  }

    // 🔑 Factory for DB → Domain rehydration
    /*
    static rehydrate(props: {
        id: string
        billId: string
        provider: PaymentProvider
        amount: number
        currency: string
        status: PaymentStatus
        expiresAt: Date
        externalReference?: string
        confirmedAt?: Date
    }): PaymentIntent {
        return new PaymentIntent(
            props.id,
            props.billId,
            props.provider,
            props.amount,
            props.currency,
            props.status,
            props.expiresAt,
            props.externalReference,
            props.confirmedAt,
        )
    }
*/
// 🔹 Getters
  get id() { return this.props.id }
  get status() { return this.props.status }
  get userId() { return this.props.userId }
  get amount() { return this.props.amount }
  get currency() { return this.props.currency }
  get billId() { return this.props.billId }
  get provider() { return this.props.provider }  
  get expiresAt() { return this.props.expiresAt }
  get externalReference() { return this.props.externalReference }
  get confirmedAt() { return this.props.confirmedAt }

  // 🔹 State Machine Transitions
  activate() {
    this.transitionTo(PaymentStatus.PENDING)
  }
  /*
    markPending() {
        if(this.status !== PaymentStatus.CREATED) {
            throw new Error(`Cannot mark payment intent ${this.id} as PENDING from status ${this.status}`);
        }
        this.status = PaymentStatus.PENDING;
    }
*/
  confirm() {
    if (this.props.status === PaymentStatus.PAID) {
      return // idempotent
    }
    this.transitionTo(PaymentStatus.PAID)
  }

  fail() {    
    this.transitionTo(PaymentStatus.FAILED)
  }

  expire() {
    this.transitionTo(PaymentStatus.EXPIRED)
  }

  cancel() {
    this.transitionTo(PaymentStatus.CANCELLED)
  }

    // 🔹 Core guard logic
  private transitionTo(next: PaymentStatus) {
    const current = this.props.status

    if (this.isFinal(current)) {
      throw new PaymentAlreadyFinalizedError(current)
    }

    if (!this.isAllowedTransition(current, next)) {
      throw new InvalidStatusTransitionError(current, next)
    }

    this.props.status = next
    this.props.updatedAt = new Date()
  }

  private isFinal(status: PaymentStatus): boolean {
    return [
      PaymentStatus.PAID,
      PaymentStatus.FAILED,
      PaymentStatus.EXPIRED,
      PaymentStatus.CANCELLED,
    ].includes(status)
  }

   private isAllowedTransition(
    from: PaymentStatus,
    to: PaymentStatus,
  ): boolean {
    const transitions: Record<PaymentStatus, PaymentStatus[]> = {
      CREATED: [PaymentStatus.PENDING, PaymentStatus.CANCELLED],
      PENDING: [
        PaymentStatus.PAID,
        PaymentStatus.FAILED,
        PaymentStatus.EXPIRED,
        PaymentStatus.CANCELLED,
      ],
      PAID: [],
      FAILED: [],
      EXPIRED: [],
      CANCELLED: [],
    }
    return transitions[from]?.includes(to) ?? false
  }

  // 🔹 Serialize for persistence
  toPersistence(): PaymentIntentProps {
    return { ...this.props }
  }
}