/*
providers: [
PrismaService,
{
provide: 'PaymentIntentRepository',
useClass: PrismaPaymentIntentRepository,
},
]
*/


// Inject using:
// constructor(@Inject('PaymentIntentRepository') repo: PaymentIntentRepository)
