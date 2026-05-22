import { injectable } from "tsyringe";
import { Client, IClient } from "../models/Client.model";
import { User } from "../models/User.model"; // Importar User para que Mongoose registre su Schema antes de hacer populate
import { CreateClientCommand, UpdateClientCommand, ClientDto } from "../types/IClient.types";
import { Sale } from '../models/Sale.model';
import { CashRegisterRepository } from "./CashRegister.repository";

@injectable()
export class ClientRepository {
  constructor(private cashRegisterRepository: CashRegisterRepository) {}
  
  private mapToDto(client: IClient): ClientDto {
    return {
      id: client._id.toString(),
      name: client.name,
      phone: client.phone,
      email: client.email,
      debt: client.debt,
      maxCredit: client.maxCredit,
      active: client.active,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }

  async createClient(command: CreateClientCommand): Promise<ClientDto> {
    const client = new Client(command);
    await client.save();
    return this.mapToDto(client);
  }

  async getClientById(id: string): Promise<ClientDto | null> {
    const client = await Client.findById(id);
    if (!client) return null;
    return this.mapToDto(client);
  }

  async getAllClients(): Promise<ClientDto[]> {
    const clients = await Client.find({ active: true });
    return clients.map(client => this.mapToDto(client));
  }

  async updateClient(id: string, command: UpdateClientCommand): Promise<ClientDto | null> {
    const client = await Client.findByIdAndUpdate(
      id,
      { $set: command },
      { new: true, runValidators: true }
    );
    if (!client) return null;
    return this.mapToDto(client);
  }

  async deleteClient(id: string): Promise<void> {
    // Soft delete: Desactivar en vez de borrar físicamente
    await Client.findByIdAndUpdate(id, { $set: { active: false } });
  }

  // Permite sumar o restar deudas
  async updateDebt(id: string, amount: number): Promise<ClientDto | null> {
    const client = await Client.findById(id);
    if (!client) return null;

    // Si amount es negativo, significa que es un PAGO/ABONO de deuda del cliente
    if (amount < 0) {
      const paymentAmount = Math.abs(amount);
      
      // Validar que hay una caja abierta para ingresar el dinero del pago
      const openCashRegister = await this.cashRegisterRepository.getOpenCashRegister();
      if (!openCashRegister) {
        throw new Error('No hay una caja abierta. Debe abrir la caja antes de registrar un pago de deuda de cliente.');
      }

      // Descontar deuda del cliente en su ficha
      client.debt = Number(client.debt) - paymentAmount;
      if (client.debt < 0) client.debt = 0; // Asegurarse que no quede en negativo por un redondeo
      await client.save();

      // Registrar el pago de deuda en la caja
      await this.cashRegisterRepository.updateTotals(
        openCashRegister.id,
        'efectivo',        // Entra como efectivo
        paymentAmount,     
        0,                 // Costo 0
        0                  // Ganancia 0 (la ganancia ya se contó en la venta original)
      );

      // Crear un documento de Venta para que quede registrado en los Ingresos (Dashboard/Reportes)
      // Lo marcamos con una nota especial para poder filtrarlo si es necesario
      const sale = new Sale({
        seller: openCashRegister.user, // idealmente vendría en el command, pero fallback a quien abrió la caja
        cashRegister: openCashRegister.id,
        client: id,
        total: paymentAmount,
        status: 'pagado',
        paymentMethod: 'efectivo',
        notes: 'ABONO_DE_DEUDA'
      });
      await sale.save();
      
      // Creamos un detalle para que aparezca en los reportes
      const { SaleDetail } = require('../models/SaleDetail.model');
      const detail = new SaleDetail({
        sale: sale._id,
        product: null,
        productName: `ABONO DE DEUDA - ${client.name}`,
        unitType: 'unidad',
        unitPrice: paymentAmount,
        costPrice: 0,
        quantity: 1,
        subtotal: paymentAmount,
        profit: paymentAmount // Para los reportes diarios
      });
      await detail.save();
    } else {
      // Si amount es positivo (estamos agregando deuda al fiar una venta)
      client.debt = Number(client.debt) + amount;
      await client.save();
    }
    
    return this.mapToDto(client);
  }
}
