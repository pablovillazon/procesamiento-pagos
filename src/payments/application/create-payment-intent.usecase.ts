import { v4 as uuid } from 'uuid'
import { PaymentIntent } from '../domain/payment-intent.entity'
import { PaymentIntentRepository } from '../domain/payment-intent.repository'
import { PaymentProvider } from '../domain/payment-intent.entity'


export interface CreatePaymentIntentCommand {
    billId: string
    provider: PaymentProvider
    amount: number
}


export class CreatePaymentIntentUseCase {
    constructor(
        private readonly paymentIntentRepository: PaymentIntentRepository,
    ) {}


    async execute(command: CreatePaymentIntentCommand): Promise<PaymentIntent> {
        // 1. Business validations (simplified for now)
        if (command.amount <= 0) {
            throw new Error('Payment amount must be greater than zero')
        }


        // 2. Calculate expiration (QR payments usually short-lived)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes


        // 3. Create domain entity
        const paymentIntent = PaymentIntent.create({
            id: uuid(),
            billId: command.billId,
            provider: command.provider,
            amount: command.amount,
            currency: 'BOB',
            expiresAt,
        })


        // 4. Persist
        await this.paymentIntentRepository.save(paymentIntent)


        // 5. Return domain entity (NOT Prisma model)
        return paymentIntent
    }
}