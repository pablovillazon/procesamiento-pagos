import { Bill } from './bill.entity';

export const BILL_REPOSITORY = 'BillRepository';

export interface BillRepository {
    create(bill: Bill): Promise<Bill>;
    findById(id: string): Promise<Bill | null>;
    findAll(): Promise<Bill[]>;
    update(bill: Bill): Promise<Bill>;
    delete(id: string): Promise<void>;
    save(bill: Bill): Promise<void>;    
}