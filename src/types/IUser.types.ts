export interface CreateUserCommand {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'vendedor';
}
export interface UpdateUserCommand {
  name?: string;
  email?: string;
  role?: 'admin' | 'vendedor';
  active?: boolean;
}
export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendedor';
  active: boolean;
  createdAt: Date;
}