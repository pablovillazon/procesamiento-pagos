import { IsUUID, IsEnum, IsOptional } from "class-validator";
import { PaymentProvider } from "../domain/payment-intent.entity";

export class CreatePaymentIntentDto {
    @IsUUID()
    billId: string;

    @IsEnum(PaymentProvider)
    provider: PaymentProvider;
    
    @IsOptional()
    idempotencyKey?: string;
}