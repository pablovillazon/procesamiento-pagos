import { PaymentIntent } from "./payment-intent.entity";

export const PAYMENT_INTENT_REPOSITORY = 'PaymentIntentRepository';

export interface PaymentIntentRepository {
    save(paymentIntent: PaymentIntent): Promise<void>;
    findById(id: string): Promise<PaymentIntent | null>;
    findActiveByBillId(billId: string): Promise<PaymentIntent | null>;
    //update(paymentIntent: PaymentIntent): Promise<void>;
    findByExternalReference(externalReference: string): Promise<PaymentIntent | null>;
}