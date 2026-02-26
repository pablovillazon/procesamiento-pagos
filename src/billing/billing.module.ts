import { Module } from '@nestjs/common';
import { BillRepository, BILL_REPOSITORY } from './domain/bill.repository';
import { PrismaBillRepository } from './infraestructure/prisma-bill.repository';

@Module({
    providers: [
        {
            provide: BILL_REPOSITORY,
            useClass: PrismaBillRepository,
        },
    ],
    exports: [BILL_REPOSITORY],
})
export class BillingModule {}