// payment-intent.errors.ts

export class InvalidStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Invalid status transition: ${from} → ${to}`)
  }
}

export class PaymentAlreadyFinalizedError extends Error {
  constructor(status: string) {
    super(`Payment already finalized with status: ${status}`)
  }
}