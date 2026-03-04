import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async createUser(
    username: string,
    password: string,
    fullName?: string,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({
      username,
      password: hashedPassword,
      fullName,
    });
    return this.usersRepo.save(user);
  }

  async changePassword(userId: number, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepo.update(userId, { password: hashedPassword });
  }

  async updateProfile(
    userId: number,
    data: { fullName?: string; email?: string },
  ): Promise<User | null> {
    await this.usersRepo.update(userId, data);
    return this.usersRepo.findOne({ where: { id: userId } });
  }

  async getProfile(userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }
}
