import { injectable } from 'tsyringe';
import { CashMovementRepository } from '../repository/CashMovement.repository';
import { CashRegisterRepository } from '../repository/CashRegister.repository';
import { AuditService } from './Audit.services';
import { CreateCashMovementCommand, CashMovementDto } from '../types/ICashMovement.types';

@injectable()
export class CashMovementService {
  constructor(
    private cashMovementRepository: CashMovementRepository,
    private cashRegisterRepository: CashRegisterRepository,
    private auditService: AuditService
  ) {}

  async createMovement(command: CreateCashMovementCommand, ip?: string): Promise<CashMovementDto> {
    // Verificar que la caja existe y está abierta
    const cashRegister = await this.cashRegisterRepository.getOpenCashRegister();

    if (!cashRegister || cashRegister.id !== command.cashRegister) {
      throw new Error('La caja no está abierta o no existe');
    }

    // Crear el movimiento
    const movement = await this.cashMovementRepository.createMovement(command);

    // Actualizar totales de la caja
    if (command.type === 'retiro') {
      await this.cashRegisterRepository.updateCashMovementTotals(command.cashRegister, 'retiro', command.amount);
    } else {
      await this.cashRegisterRepository.updateCashMovementTotals(command.cashRegister, 'ingreso', command.amount);
    }

    // Registrar auditoría
    await this.auditService.createAudit({
      user: command.user,
      action: command.type === 'retiro' ? 'UPDATE' : 'UPDATE',
      entity: 'CashRegister',
      entityId: command.cashRegister,
      description: `${command.type === 'retiro' ? 'Retiro' : 'Ingreso'} de efectivo: $${command.amount} - Motivo: ${command.reason}`,
      changes: {
        after: {
          type: command.type,
          amount: command.amount,
          reason: command.reason,
        }
      },
      ip
    });

    return movement;
  }

  async getMovementsByCashRegister(cashRegisterId: string): Promise<CashMovementDto[]> {
    return this.cashMovementRepository.getMovementsByCashRegister(cashRegisterId);
  }
}
