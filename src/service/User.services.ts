import { injectable } from "tsyringe";
import { UserRepository } from "../repository/User.repository";
import { CreateUserCommand, UpdateUserCommand, UserDto } from "../types/IUser.types";


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
}