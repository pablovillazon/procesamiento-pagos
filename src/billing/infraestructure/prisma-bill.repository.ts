import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BillRepository } from "../domain/bill.repository";
import { Bill } from "../domain/bill.entity";
import { BillStatus as DomainStatus } from "../domain/bill-status.enum";
import { BillStatus as PrismaStatus } from "@prisma/client";
import { Bill as PrismaBill } from "../../generated/prisma/client";

export const toPrismaStatus = (status: DomainStatus): PrismaStatus => {
  return status as unknown as PrismaStatus;
};

export const toDomainStatus = (status: PrismaStatus): DomainStatus => {
  return status as unknown as DomainStatus;
};

@Injectable()
export class PrismaBillRepository implements BillRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string): Promise<Bill | null> {
        console.log(`Finding bill with ID: ${id}`);
        const bill = await this.prisma.bill.findUnique({ where: { id } });
        return bill ? this.toDomain(bill) : null;
    }

    async save(bill: Bill): Promise<void> {
        const data = this.toPrisma(bill);
        await this.prisma.bill.upsert({
            where: { id: bill.id },
            update: data,
            create: data,
        });
    }

    async findAll(): Promise<Bill[]> {
        const bills = await this.prisma.bill.findMany();
        return bills.map(this.toDomain);
    }

    async create(bill: Bill): Promise<Bill> {
        const data = this.toPrisma(bill);
        const createdBill = await this.prisma.bill.create({ data });
        return this.toDomain(createdBill);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.bill.delete({ where: { id } });
    }

    async update(bill: Bill): Promise<Bill> {
        const data = this.toPrisma(bill);
        const updatedBill = await this.prisma.bill.update({
            where: { id: bill.id },
            data,
        });
        return this.toDomain(updatedBill);
    }

    private toDomain(prismaBill: PrismaBill): Bill {
        return Bill.fromPersistence({
            id: prismaBill.id,
            userId: prismaBill.userId,
            totalAmount: prismaBill.totalAmount,
            status: prismaBill.status as DomainStatus,
        });
    }

    private toPrisma(bill: Bill): PrismaBill {
        return {
            id: bill.id,
//            status: bill.status as BillStatus,
            userId: bill.userId,
            totalAmount: bill.totalAmount,
            consumptionM3: 0, // Placeholder, adjust as needed
            createdAt: new Date(), // Placeholder, adjust as needed
            fixedAmount: 0, // Placeholder, adjust as needed
            period: '', // Placeholder, adjust as needed
            variableAmount: 0, // Placeholder, adjust as needed
            status: toPrismaStatus(bill.status),
        };
    }
}
