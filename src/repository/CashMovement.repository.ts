import { ICashMovement, CashMovement } from '../models/CashMovement.model';
import { injectable } from 'tsyringe';
import { Types } from 'mongoose';
import { CreateCashMovementCommand, CashMovementDto } from '../types/ICashMovement.types';

@injectable()
export class CashMovementRepository {

  async createMovement(command: CreateCashMovementCommand): Promise<CashMovementDto> {
    const movement = new CashMovement({
      cashRegister: new Types.ObjectId(command.cashRegister),
      user: new Types.ObjectId(command.user),
      type: command.type,
      amount: command.amount,
      reason: command.reason,
      notes: command.notes,
    });

    await movement.save();
    return this.toDto(movement);
  }

  async getMovementsByCashRegister(cashRegisterId: string): Promise<CashMovementDto[]> {
    const movements = await CashMovement.find({
      cashRegister: new Types.ObjectId(cashRegisterId),
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return movements.map(m => this.toDto(m));
  }

  async getTotalsByCashRegister(cashRegisterId: string): Promise<{ totalWithdrawals: number; totalDeposits: number }> {
    const movements = await CashMovement.find({
      cashRegister: new Types.ObjectId(cashRegisterId),
    });

    let totalWithdrawals = 0;
    let totalDeposits = 0;

    for (const movement of movements) {
      if (movement.type === 'retiro') {
        totalWithdrawals += movement.amount;
      } else {
        totalDeposits += movement.amount;
      }
    }

    return {
      totalWithdrawals: parseFloat(totalWithdrawals.toFixed(2)),
      totalDeposits: parseFloat(totalDeposits.toFixed(2)),
    };
  }

  private toDto(movement: ICashMovement): CashMovementDto {
    const userIdStr = movement.user && (movement.user as any)._id
      ? (movement.user as any)._id.toString()
      : movement.user && (movement.user as any).id
        ? (movement.user as any).id.toString()
        : movement.user.toString();

    return {
      id: movement._id.toString(),
      cashRegister: movement.cashRegister.toString(),
      user: userIdStr,
      type: movement.type,
      amount: movement.amount,
      reason: movement.reason,
      notes: movement.notes,
      createdAt: movement.createdAt,
      updatedAt: movement.updatedAt,
    };
  }
}
