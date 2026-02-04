import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { 
    PaymentIntent,
    PaymentProvider,
    PaymentStatus         
 } from "../../domain/payment-intent.entity";
import { PaymentIntentRepository } from "../../domain/payment-intent.repository";

//import { PaymentIntent as PrismaPaymentIntent } from '@prisma/client';


@Injectable()
export class PrismaPaymentIntentRepository 
    implements PaymentIntentRepository 
{
    constructor(private readonly prisma: PrismaService) {}

    async save(paymentIntent: PaymentIntent): Promise<void> {
        await this.prisma.paymentIntent.upsert({
            where: { id: paymentIntent.id },
            update: this.toPrisma(paymentIntent),
            create: this.toPrisma(paymentIntent),
        });
    }

    async findById(id: string): Promise<PaymentIntent | null> {
        const record = await this.prisma.paymentIntent.findUnique({ where: { id } });
        if (!record) return null;
        return this.toDomain(record);
    }

    async findByExternalReference(externalReference: string): Promise<PaymentIntent | null> {
        const record = await this.prisma.paymentIntent.findFirst({ where: { externalReference } });
        if (!record) return null;
        return this.toDomain(record);
    }

    private toPrisma(paymentIntent: PaymentIntent) {
        return {
            id: paymentIntent.id,
            billId: paymentIntent.billId,
            provider: paymentIntent.provider,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.getStatus(),
            expiresAt: paymentIntent.expiresAt,
            externalReference: paymentIntent.externalReference ?? null,
            confirmedAt: paymentIntent.confirmedAt ?? null,
        };
    }
    private toDomain(record: PrismaPaymentIntent): PaymentIntent {
        return new PaymentIntent(
            record.id,
            record.billId,
            record.provider as PaymentProvider,
            record.amount,
            record.currency,
            record.status as PaymentStatus,
            record.expiresAt,
            record.externalReference ?? undefined,
            record.confirmedAt ?? undefined,
        );
    }
}