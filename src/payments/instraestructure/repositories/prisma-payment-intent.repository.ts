import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { 
    PaymentIntent,
    PaymentProvider
 } from "../../domain/payment-intent.entity";
import { PaymentIntentRepository } from "../../domain/payment-intent.repository";
import { PaymentIntent as PrismaPaymentIntent }  from '@prisma/client';
import { PaymentStatus } from "src/payments/domain/payment-intent-status.enum";



@Injectable()
export class PrismaPaymentIntentRepository 
    implements PaymentIntentRepository 
{
    constructor(private readonly prisma: PrismaService) {}
    

    async save(paymentIntent: PaymentIntent): Promise<void> {
        const data = this.toPrisma(paymentIntent);

        await this.prisma.paymentIntent.upsert({
            where: { id: paymentIntent.id },            
            //update: data,
            update: {
                billId: data.billId,
                provider: data.provider,
                //amount: data.amount,
                currency: data.currency,
                //status: data.status,                
                expiresAt: data.expiresAt,
                externalReference: data.externalReference,
                confirmedAt: data.confirmedAt,
            },            
            create: {
                id: data.id,
                billId: data.billId,
                provider: data.provider,
                amount: data.amount,
                currency: data.currency,
                status: PaymentStatus.CREATED, // Always start with CREATED on new records
                expiresAt: data.expiresAt,
                externalReference: data.externalReference ?? null,
                confirmedAt: data.confirmedAt ?? null,
            },
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

    async findActiveByBillId(billId: string): Promise<PaymentIntent | null> {
        const record = await this.prisma.paymentIntent.findFirst({
            where: {
                billId,
                status: { in: [PaymentStatus.CREATED, PaymentStatus.PENDING] }, // Only active payment intents are considered "active"
            },
        });
        if (!record) return null;
        return this.toDomain(record);
    }

    // 🔹 Domain → Prisma mapping
    private toPrisma(paymentIntent: PaymentIntent) {
        const props = paymentIntent.toPersistence();

        return {
            id: props.id,
            billId: props.billId,
            provider: props.provider,
            amount: props.amount,
            currency: props.currency,
            status: props.status,
            expiresAt: props.expiresAt,
            externalReference: props.externalReference ?? null,
            confirmedAt: props.confirmedAt ?? null,
        };
    }

    // 🔹 Prisma → Domain (rehydration)
    private toDomain(record: PrismaPaymentIntent): PaymentIntent {
        return PaymentIntent.fromPersistence({
            id: record.id,
            userId: "testUserId",//record.userId,
            billId: record.billId,
            provider: record.provider as PaymentProvider,
            amount: record.amount,
            currency: record.currency,
            status: this.mapStatus(record.status as PaymentStatus),
            expiresAt: record.expiresAt,
            externalReference: record.externalReference ?? undefined,
            confirmedAt: record.confirmedAt ?? undefined,
            createdAt: record.createdAt,
            //updatedAt: record.updatedAt,
            //updatedAt: record.updatedAt ?? undefined,
        });
    }

    private mapStatus(status: PaymentStatus): PaymentStatus {
    switch (status) {
        case 'CREATED':
        return PaymentStatus.CREATED;        
        case 'FAILED':            
        return PaymentStatus.FAILED;
        case 'PAID':
        return PaymentStatus.PAID;
        case 'PENDING':
        return PaymentStatus.PENDING;
        case 'EXPIRED':
        return PaymentStatus.EXPIRED;
        case 'CANCELLED':
        return PaymentStatus.CANCELLED;        
        default:
        throw new Error(`Unknown status: ${status}`);
    }
}

}