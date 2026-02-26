import { v4 as uuid } from 'uuid'
import { PaymentIntent } from '../domain/payment-intent.entity'
import { PaymentIntentRepository } from '../domain/payment-intent.repository'
import { PaymentProvider } from '../domain/payment-intent.entity'
import { BillRepository } from '../../billing/domain/bill.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface CreatePaymentIntentCommand {
    billId: string
    provider: PaymentProvider
    //amount: number
}

@Injectable()
export class CreatePaymentIntentUseCase {
    constructor(
        @Inject('PaymentIntentRepository')
        private readonly paymentIntentRepository: PaymentIntentRepository,
        
        @Inject('BillRepository')
        private readonly billRepository: BillRepository,
    ) {}


    async execute(command: CreatePaymentIntentCommand): Promise<PaymentIntent> {
        const {billId, provider} = command;

        console.log('billRepository:', this.billRepository);

        // Verificar factura
        const bill = await this.billRepository.findById(billId);
        if (!bill) {
            throw new Error('Bill not found');
        }

        if (bill.status !== 'PENDING') {
            throw new Error('Bill is not pending');
        }
        // Evitar crear intentos de pago para facturas activas
        const existing = await this.paymentIntentRepository.findActiveByBillId(billId);
        if (existing) {
            throw new Error('An active payment intent already exists for this bill');
        }


        // 2. Calculate expiration (QR payments usually short-lived)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // 3. Create domain entity
        const paymentIntent = PaymentIntent.create({
            id: uuid(),
            userId: 'testUserId', // In real case, get from auth context
            billId: command.billId,
            amount: bill.totalAmount,
            currency: 'BOB', // Assuming Bolivianos for this example
            description: 'Payment for services',            
            expiresAt: expiresAt,
            provider: command.provider,
        });

        // 4. Persist
        await this.paymentIntentRepository.save(paymentIntent)


        // 5. Return domain entity (NOT Prisma model)
        return paymentIntent
    }
}