import { IUser, User } from '../models/User.model';
import { injectable } from 'tsyringe';
import { CreateUserCommand, UpdateUserCommand, UserDto } from '../types/IUser.types';


//interfaz de usuario
interface IUserRepository {
  createUser(command: CreateUserCommand): Promise<UserDto>;
  getUserById(id: string): Promise<UserDto | null>;
  getAllUsers(): Promise<UserDto[]>;
  updateUser(id: string, command: UpdateUserCommand): Promise<UserDto | null>;
  deleteUser(id: string): Promise<void>;
}

@injectable()
export class UserRepository implements IUserRepository {
  async createUser(command: CreateUserCommand): Promise<UserDto> {
    const user = new User(command);
    await user.save();
    return this.toDto(user);
  }
  
  async getUserById(id: string): Promise<UserDto | null> {
    const user = await User.findById(id);
    return user ? this.toDto(user) : null;
  }

  async getAllUsers(): Promise<UserDto[]> {
    const users = await User.find();
    return users.map(user => this.toDto(user));
  }

  async updateUser(id: string, command: UpdateUserCommand): Promise<UserDto | null> {
    const user = await User.findByIdAndUpdate(id, command, { new: true });
    return user ? this.toDto(user) : null;
  }

  async deleteUser(id: string): Promise<void> {
    await User.findByIdAndDelete(id);
  }

  private toDto(user: IUser): UserDto {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
    };
  }
}