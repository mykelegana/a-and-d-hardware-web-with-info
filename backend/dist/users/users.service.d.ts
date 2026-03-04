import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UsersService {
    private usersRepo;
    constructor(usersRepo: Repository<User>);
    findByUsername(username: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    createUser(username: string, password: string, fullName?: string): Promise<User>;
    changePassword(userId: number, newPassword: string): Promise<void>;
    updateProfile(userId: number, data: {
        fullName?: string;
        email?: string;
    }): Promise<User | null>;
    getProfile(userId: number): Promise<{
        id: number;
        username: string;
        role: string;
        fullName: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
