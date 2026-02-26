import { Body, Controller, Post } from '@nestjs/common';
import { CreatePaymentIntentUseCase } from './application/create-payment-intent.usecase';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Controller('payment-intents')
export class PaymentsController {
    constructor(private readonly createPaymentIntent: CreatePaymentIntentUseCase,

    ) {}

    @Post()
    async create(@Body() dto: CreatePaymentIntentDto) {
        const paymentIntent = await this.createPaymentIntent.execute(dto);
        return { 
            id: paymentIntent.id,
            billId: paymentIntent.billId,
            provider: paymentIntent.provider,
            //amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            expiresAt: paymentIntent.expiresAt,
            externalReference: paymentIntent.externalReference,
            confirmedAt: paymentIntent.confirmedAt,
        };
    }

}