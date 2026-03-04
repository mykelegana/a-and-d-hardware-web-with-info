import { UsersService } from './users.service';
import { ChangePasswordDto, UpdateProfileDto } from './users.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        id: number;
        username: string;
        role: string;
        fullName: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
        id: number;
        username: string;
        role: string;
        fullName: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
