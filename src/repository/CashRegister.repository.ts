import { ICashRegister, CashRegister } from '../models/CashRegister.model';
import { Sale } from '../models/Sale.model';
import { injectable } from 'tsyringe';
import { Types } from 'mongoose';
import { OpenCashRegisterCommand, CloseCashRegisterCommand, CashRegisterDto } from '../types/ICashRegister.types';

interface ICashRegisterRepository {
  openCashRegister(command: OpenCashRegisterCommand): Promise<CashRegisterDto>;
  getOpenCashRegister(): Promise<CashRegisterDto | null>;
  getCashRegisterById(id: string): Promise<CashRegisterDto | null>;
  getAllCashRegisters(): Promise<CashRegisterDto[]>;
  getCashRegistersByUser(userId: string): Promise<CashRegisterDto[]>;
  closeCashRegister(id: string, command: CloseCashRegisterCommand): Promise<CashRegisterDto | null>;
  updateTotals(cashRegisterId: string, paymentMethod: string, amount: number): Promise<void>;
}

@injectable()
export class CashRegisterRepository implements ICashRegisterRepository {
  
  async openCashRegister(command: OpenCashRegisterCommand): Promise<CashRegisterDto> {
    // Verificar que no haya una caja abierta
    const openCashRegister = await CashRegister.findOne({ status: 'abierta' });
    
    if (openCashRegister) {
      throw new Error('Ya existe una caja abierta. Debe cerrarla antes de abrir una nueva.');
    }

    // Obtener el monto dejado de la última caja cerrada
    const lastCashRegister = await CashRegister.findOne({ status: 'cerrada' })
      .sort({ closedAt: -1 });
    
    const leftFromPrevious = lastCashRegister?.leftForNext || 0;
    const totalInitialCash = command.initialCash + leftFromPrevious;

    const cashRegister = new CashRegister({
      user: new Types.ObjectId(command.user),
      status: 'abierta',
      openedAt: new Date(),
      initialCash: totalInitialCash,
      leftForNext: 0,
      notes: command.notes,
    });

    await cashRegister.save();
    return this.toDto(cashRegister);
  }

  async getOpenCashRegister(): Promise<CashRegisterDto | null> {
    const cashRegister = await CashRegister.findOne({ status: 'abierta' })
      .populate('user', 'name email');
    
    return cashRegister ? this.toDto(cashRegister) : null;
  }

  async getCashRegisterById(id: string): Promise<CashRegisterDto | null> {
    const cashRegister = await CashRegister.findById(id)
      .populate('user', 'name email');
    
    return cashRegister ? this.toDto(cashRegister) : null;
  }

  async getAllCashRegisters(): Promise<CashRegisterDto[]> {
    const cashRegisters = await CashRegister.find()
      .populate('user', 'name email')
      .sort({ openedAt: -1 });
    
    return cashRegisters.map(cr => this.toDto(cr));
  }

  async getCashRegistersByUser(userId: string): Promise<CashRegisterDto[]> {
    const cashRegisters = await CashRegister.find({ user: new Types.ObjectId(userId) })
      .populate('user', 'name email')
      .sort({ openedAt: -1 });
    
    return cashRegisters.map(cr => this.toDto(cr));
  }

  async closeCashRegister(id: string, command: CloseCashRegisterCommand): Promise<CashRegisterDto | null> {
    const cashRegister = await CashRegister.findById(id);
    
    if (!cashRegister) {
      return null;
    }

    if (cashRegister.status === 'cerrada') {
      throw new Error('Esta caja ya está cerrada');
    }

    cashRegister.status = 'cerrada';
    cashRegister.closedAt = new Date();
    cashRegister.finalCash = command.finalCash;
    cashRegister.leftForNext = command.leftForNext;
    if (command.notes) {
      cashRegister.notes = command.notes;
    }

    await cashRegister.save();
    await cashRegister.populate('user', 'name email');
    
    return this.toDto(cashRegister);
  }

  async updateTotals(cashRegisterId: string, paymentMethod: string, amount: number): Promise<void> {
    const incrementFields: Record<string, number> = {
      totalSales: amount,
      salesCount: amount > 0 ? 1 : -1, // Si es negativo (cancelación), restar 1
    };

    if (paymentMethod === 'efectivo') {
      incrementFields.totalCash = amount;
    } else if (paymentMethod === 'transferencia') {
      incrementFields.totalTransfer = amount;
    } else if (paymentMethod === 'cuenta_corriente') {
      incrementFields.totalCuentaCorriente = amount;
    }

    await CashRegister.findByIdAndUpdate(cashRegisterId, {
      $inc: incrementFields
    });
  }

  private toDto(cashRegister: ICashRegister): CashRegisterDto {
    // Calcular efectivo esperado: inicial + ventas en efectivo - lo que se deja
    const expectedCash = cashRegister.initialCash + cashRegister.totalCash - cashRegister.leftForNext;
    const difference = cashRegister.finalCash ? cashRegister.finalCash - expectedCash : undefined;

    return {
      id: cashRegister._id.toString(),
      user: cashRegister.user.toString(),
      status: cashRegister.status,
      openedAt: cashRegister.openedAt,
      closedAt: cashRegister.closedAt,
      initialCash: cashRegister.initialCash,
      finalCash: cashRegister.finalCash,
      leftForNext: cashRegister.leftForNext,
      totalCash: cashRegister.totalCash,
      totalTransfer: cashRegister.totalTransfer,
      totalCuentaCorriente: cashRegister.totalCuentaCorriente,
      totalSales: cashRegister.totalSales,
      salesCount: cashRegister.salesCount,
      expectedCash: parseFloat(expectedCash.toFixed(2)),
      difference: difference !== undefined ? parseFloat(difference.toFixed(2)) : undefined,
      notes: cashRegister.notes,
      createdAt: cashRegister.createdAt,
      updatedAt: cashRegister.updatedAt,
    };
  }
}
