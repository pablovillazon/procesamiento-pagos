export enum PaymentStatus {
    CREATED = 'CREATED',
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    FAILED = 'FAILED',
    EXPIRED = 'EXPIRED',
}

export enum PaymentProvider {
    QR_BNB = 'QR_BNB',
    QR_BCP = 'QR_BCP',
    QR_SIMPLE = 'QR_SIMPLE',
}

export class PaymentIntent {
    constructor(
    readonly id: string,
    readonly billId: string,
    readonly provider: PaymentProvider,
    readonly amount: number,
    readonly currency: string,
    private status: PaymentStatus,
    readonly expiresAt: Date,
    readonly externalReference?: string,
    readonly confirmedAt?: Date,
) {}

    // 🔑 Factory for NEW payment intents
    static create(props: {
        id: string
        billId: string
        provider: PaymentProvider
        amount: number
        currency: string
        expiresAt: Date
    }): PaymentIntent {
        return new PaymentIntent(
        props.id,
        props.billId,
        props.provider,
        props.amount,
        props.currency,
        PaymentStatus.CREATED,
        props.expiresAt,
        )
    }

    // 🔑 Factory for DB → Domain rehydration
    static rehydrate(props: {
        id: string
        billId: string
        provider: PaymentProvider
        amount: number
        currency: string
        status: PaymentStatus
        expiresAt: Date
        externalReference?: string
        confirmedAt?: Date
    }): PaymentIntent {
        return new PaymentIntent(
            props.id,
            props.billId,
            props.provider,
            props.amount,
            props.currency,
            props.status,
            props.expiresAt,
            props.externalReference,
            props.confirmedAt,
        )
    }

    getStatus(): PaymentStatus {
        return this.status;
    }

    markPending() {
        if(this.status !== PaymentStatus.CREATED) {
            throw new Error(`Cannot mark payment intent ${this.id} as PENDING from status ${this.status}`);
        }
        this.status = PaymentStatus.PENDING;
    }

    confirm() {
        if(this.status !== PaymentStatus.PENDING) {
            throw new Error(`Cannot confirm payment intent ${this.id} from status ${this.status}`);
        }
        this.status = PaymentStatus.CONFIRMED;
    }

    fail() {
        if(this.status === PaymentStatus.CONFIRMED) {
            throw new Error(`Cannot fail payment intent ${this.id} from status ${this.status}`);
        }
        this.status = PaymentStatus.FAILED;
    }

    expire(now: Date = new Date()) {
        if(now < this.expiresAt) {
            throw new Error(`Cannot expire payment intent ${this.id} before its expiration date ${this.expiresAt}`);
        }
        this.status = PaymentStatus.EXPIRED;
    }
}