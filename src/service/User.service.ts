import { injectable } from "tsyringe";
import { UserRepository } from "../repository/User.repository";
import { CreateUserCommand, UpdateUserCommand, UserDto, LoginCommand, LoginResponse } from "../types/IUser.types";
import jwt from 'jsonwebtoken';
import { AppError } from "../middlewares/errorHandler";


@injectable()
export class UserService {
    constructor(private userRepository: UserRepository) { }
    
    async createUser(command: CreateUserCommand): Promise<UserDto> {
        return this.userRepository.createUser(command);
    }

    async getUserById(id: string): Promise<UserDto | null> {
        return this.userRepository.getUserById(id);
    }

    async getAllUsers(): Promise<UserDto[]> {
        return this.userRepository.getAllUsers();
    }

    async updateUser(id: string, command: UpdateUserCommand): Promise<UserDto | null> {
        return this.userRepository.updateUser(id, command);
    }

    async deleteUser(id: string): Promise<void> {
        return this.userRepository.deleteUser(id);
    }

    async login(command: LoginCommand): Promise<LoginResponse> {
        const user = await this.userRepository.getUserByEmailWithPassword(command.email);
        
        if (!user) {
            throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
        }

        if (!user.active) {
            throw new AppError('Usuario inactivo', 403, 'USER_INACTIVE');
        }

        const isPasswordValid = await user.comparePassword(command.password);
        
        if (!isPasswordValid) {
            throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
        }

        const token = jwt.sign(
            {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        return {
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                active: user.active,
                createdAt: user.createdAt
            }
        };
    }
}
