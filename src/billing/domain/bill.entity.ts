import { BillStatus } from "./bill-status.enum";

export interface BillProps {
    id: string;
    userId: string;
    totalAmount: number; // in cents
    //currency: string; // ISO 4217 code
    status: BillStatus;
    //createdAt: Date;
    //updatedAt: Date;
}

export class Bill {
    private constructor(private props: BillProps) {}
    /*
    constructor(
    public readonly id: string,
    public readonly customerName: string,
    public readonly amount: number,
    public readonly createdAt: Date,
  ) {}*/

    static create(props: BillProps): Bill {
        // Here you can add any domain logic related to bill creation, e.g., validations
        return new Bill(props);
    }

    static fromPersistence(props: BillProps): Bill {
        return new Bill(props);
    }

    get id() {
        return this.props.id;
    }

    get userId() {
        return this.props.userId;
    }

    get totalAmount() {
        return this.props.totalAmount;
    }

    get status() {
        return this.props.status;
    }

    markAsPaid() {
        if (this.props.status !== BillStatus.PAID) return;
        this.props.status = BillStatus.PAID;
    }
}