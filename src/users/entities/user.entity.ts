import { Role } from '@prisma/client';

export class UserEntity {
    id: string;
    email: string;
    password: string;
    role: Role;
    active: boolean;
    createdAt: Date;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}