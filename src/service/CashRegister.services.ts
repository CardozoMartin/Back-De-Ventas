import { injectable } from "tsyringe";
import { CashRegisterRepository } from "../repository/CashRegister.repository";
import { OpenCashRegisterCommand, CloseCashRegisterCommand, CashRegisterDto } from "../types/ICashRegister.types";
import { AuditService } from "./Audit.services";

@injectable()
export class CashRegisterService {
  constructor(
    private cashRegisterRepository: CashRegisterRepository,
    private auditService: AuditService
  ) { }

  async openCashRegister(command: OpenCashRegisterCommand, ip?: string): Promise<CashRegisterDto> {
    const cashRegister = await this.cashRegisterRepository.openCashRegister(command);
    
    // Registrar auditoría
    await this.auditService.createAudit({
      user: command.user,
      action: "CREATE",
      entity: "CashRegister",
      entityId: cashRegister.id,
      description: `Caja abierta - Monto inicial: $${cashRegister.initialCash}`,
      changes: {
        after: {
          initialCash: cashRegister.initialCash,
          status: cashRegister.status
        }
      },
      ip
    });

    return cashRegister;
  }

  async getOpenCashRegister(): Promise<CashRegisterDto | null> {
    return this.cashRegisterRepository.getOpenCashRegister();
  }

  async getCashRegisterById(id: string): Promise<CashRegisterDto | null> {
    return this.cashRegisterRepository.getCashRegisterById(id);
  }

  async getAllCashRegisters(): Promise<CashRegisterDto[]> {
    return this.cashRegisterRepository.getAllCashRegisters();
  }

  async getCashRegistersByUser(userId: string): Promise<CashRegisterDto[]> {
    return this.cashRegisterRepository.getCashRegistersByUser(userId);
  }

  async closeCashRegister(id: string, command: CloseCashRegisterCommand, userId: string, ip?: string): Promise<CashRegisterDto | null> {
    const cashRegisterBefore = await this.cashRegisterRepository.getCashRegisterById(id);
    
    if (!cashRegisterBefore) {
      return null;
    }

    const cashRegisterAfter = await this.cashRegisterRepository.closeCashRegister(id, command);
    
    if (cashRegisterAfter) {
      // Registrar auditoría
      await this.auditService.createAudit({
        user: userId,
        action: "UPDATE",
        entity: "CashRegister",
        entityId: cashRegisterAfter.id,
        description: `Caja cerrada - Total ventas: $${cashRegisterAfter.totalSales} - Diferencia: $${cashRegisterAfter.difference || 0}`,
        changes: {
          before: { status: cashRegisterBefore.status },
          after: {
            status: cashRegisterAfter.status,
            cashCounted: cashRegisterAfter.cashCounted,
            totalSales: cashRegisterAfter.totalSales,
            totalWithdrawals: cashRegisterAfter.totalWithdrawals,
            totalDeposits: cashRegisterAfter.totalDeposits,
            difference: cashRegisterAfter.difference
          }
        },
        ip
      });
    }

    return cashRegisterAfter;
  }
}
