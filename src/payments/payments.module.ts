import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { CreatePaymentIntentUseCase } from "./application/create-payment-intent.usecase";
import { PrismaPaymentIntentRepository } from './instraestructure/repositories/prisma-payment-intent.repository';
import { PAYMENT_INTENT_REPOSITORY } from './domain/payment-intent.repository';
import { BillingModule } from '../billing/billing.module';


@Module({
    imports: [BillingModule],
    controllers: [PaymentsController],
    providers: [
        CreatePaymentIntentUseCase,
        {
            provide: PAYMENT_INTENT_REPOSITORY,
            useClass: PrismaPaymentIntentRepository,
        },
    ],
})
export class PaymentsModule {}

/*
providers: [
    {
        provide: CreatePaymentIntentUseCase,
        useFactory: (repo: PaymentIntentRepository, billRepo: BillRepository) =>
        new CreatePaymentIntentUseCase(repo, billRepo),
        inject: ['PaymentIntentRepository', 'BillRepository'],
    },
]
*/