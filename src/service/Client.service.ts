import { injectable } from "tsyringe";
import { ClientRepository } from "../repository/Client.repository";
import { CreateClientCommand, UpdateClientCommand, ClientDto } from "../types/IClient.types";

@injectable()
export class ClientService {
  constructor(private clientRepository: ClientRepository) {}

  async createClient(command: CreateClientCommand): Promise<ClientDto> {
    return this.clientRepository.createClient(command);
  }

  async getClientById(id: string): Promise<ClientDto | null> {
    return this.clientRepository.getClientById(id);
  }

  async getAllClients(): Promise<ClientDto[]> {
    return this.clientRepository.getAllClients();
  }

  async updateClient(id: string, command: UpdateClientCommand): Promise<ClientDto | null> {
    return this.clientRepository.updateClient(id, command);
  }

  async deleteClient(id: string): Promise<void> {
    return this.clientRepository.deleteClient(id);
  }

  async payDebt(id: string, amount: number): Promise<ClientDto | null> {
    // Para pagar deuda, enviamos un monto negativo
    return this.clientRepository.updateDebt(id, -amount);
  }
}
