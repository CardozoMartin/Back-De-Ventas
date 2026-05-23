import { ICashRegister, CashRegister } from '../models/CashRegister.model';
import { Sale } from '../models/Sale.model';
import { SaleDetail } from '../models/SaleDetail.model';
import { User } from '../models/User.model'; // Asegurar registro del Schema de User para los .populate('user')
import { injectable } from 'tsyringe';
import { Types } from 'mongoose';
import { OpenCashRegisterCommand, CloseCashRegisterCommand, CashRegisterDto } from '../types/ICashRegister.types';

interface ICashRegisterRepository {
  openCashRegister(command: OpenCashRegisterCommand): Promise<CashRegisterDto>;
  getOpenCashRegister(userId?: string): Promise<CashRegisterDto | null>;
  getCashRegisterById(id: string): Promise<CashRegisterDto | null>;
  getAllCashRegisters(): Promise<CashRegisterDto[]>;
  getCashRegistersByUser(userId: string): Promise<CashRegisterDto[]>;
  closeCashRegister(id: string, command: CloseCashRegisterCommand): Promise<CashRegisterDto | null>;
  updateTotals(cashRegisterId: string, paymentMethod: string, amount: number, costAmount: number, profitAmount: number): Promise<void>;
}

@injectable()
export class CashRegisterRepository implements ICashRegisterRepository {
  
  async openCashRegister(command: OpenCashRegisterCommand): Promise<CashRegisterDto> {

    const cashRegister = new CashRegister({
      user: new Types.ObjectId(command.user),
      status: 'abierta',
      openedAt: new Date(),
      initialCash: command.initialCash,
      notes: command.notes,
    });

    await cashRegister.save();
    return this.toDto(cashRegister);
  }

  async getOpenCashRegister(userId?: string): Promise<CashRegisterDto | null> {
    const query: Record<string, any> = { status: 'abierta' };
    if (userId) {
      query.user = new Types.ObjectId(userId);
    }

    const cashRegister = await CashRegister.findOne(query)
      .populate('user', 'name email');

    if (cashRegister) {
      await this.recalculateTotalsFromSales(cashRegister._id.toString());
      const refreshed = await CashRegister.findById(cashRegister._id).populate('user', 'name email');
      return refreshed ? this.toDto(refreshed) : null;
    }

    return null;
  }

  /**
   * Recalcula totales de caja desde ventas no canceladas (corrige desfases históricos).
   * Los pagos de deuda (totalDebtPayments) NO se recalculan aquí — se mantienen del incremento.
   */
  async recalculateTotalsFromSales(cashRegisterId: string): Promise<void> {
    const sales = await Sale.find({
      cashRegister: cashRegisterId,
      status: { $ne: 'cancelado' },
    });

    let totalSales = 0;
    let totalCash = 0;
    let totalTransfer = 0;
    let totalCuentaCorriente = 0;
    let totalCost = 0;
    let salesCount = 0;
    let realizedProfit = 0; // Ganancias reales de efectivo + transferencia

    for (const sale of sales) {
      // Calcular ganancia de esta venta
      const details = await SaleDetail.find({ sale: sale._id });
      let saleCost = 0;
      for (const detail of details) {
        saleCost += detail.costPrice * detail.quantity;
      }
      const saleProfit = sale.total - saleCost;

      if (sale.paymentMethod === 'efectivo') {
        totalSales += sale.total;
        salesCount += 1;
        totalCost += saleCost;
        totalCash += sale.total;
        realizedProfit += saleProfit;
      } else if (sale.paymentMethod === 'transferencia') {
        totalSales += sale.total;
        salesCount += 1;
        totalCost += saleCost;
        totalTransfer += sale.total;
        realizedProfit += saleProfit;
      } else if (sale.paymentMethod === 'cuenta_corriente') {
        totalCuentaCorriente += sale.total;
        // Al fiar, no sumamos ventas, costos ni ganancias porque el dinero no está en caja.
        // Solo registramos el monto fiado en totalCuentaCorriente para referencia.
      }
    }

    // Obtener pagos de deudas acumulados (estos se mantienen, no se recalculan)
    const currentRegister = await CashRegister.findById(cashRegisterId);
    const debtPaymentsCollected = currentRegister?.totalDebtPayments || 0;
    
    // El efectivo real = ventas en efectivo + cobros de deudas de clientes
    const finalCash = parseFloat((totalCash + debtPaymentsCollected).toFixed(2));
    
    // Ganancia realizada = solo ventas efectivo/transferencia
    // Los pagos de deuda NO son ganancia — la ganancia ya se contó en la venta original
    const finalProfit = parseFloat(realizedProfit.toFixed(2));

    await CashRegister.findByIdAndUpdate(cashRegisterId, {
      $set: {
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalCash: finalCash,
        totalTransfer: parseFloat(totalTransfer.toFixed(2)),
        totalCuentaCorriente: parseFloat(totalCuentaCorriente.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalProfit: finalProfit,
        salesCount,
        // NOTE: totalDebtPayments NO se sobreescribe — se mantiene via updateTotals()
      },
    });
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

    cashRegister.status = 'cerrada';
    cashRegister.closedAt = new Date();
    cashRegister.finalCash = command.cashCounted;
    cashRegister.cashCounted = command.cashCounted;
    if (command.denominationCount) {
      cashRegister.denominationCount = command.denominationCount;
    }
    if (command.notes) {
      cashRegister.notes = command.notes;
    }

    await cashRegister.save();
    await cashRegister.populate('user', 'name email');
    
    return this.toDto(cashRegister);
  }

  async updateTotals(cashRegisterId: string, paymentMethod: string, amount: number, costAmount: number, profitAmount: number): Promise<void> {
    const incrementFields: Record<string, number> = {};

    if (paymentMethod === 'efectivo') {
      incrementFields.totalSales = amount;
      incrementFields.totalCost = costAmount;
      incrementFields.salesCount = amount > 0 ? 1 : -1;
      incrementFields.totalCash = amount;
      incrementFields.totalProfit = profitAmount;
    } else if (paymentMethod === 'transferencia') {
      incrementFields.totalSales = amount;
      incrementFields.totalCost = costAmount;
      incrementFields.salesCount = amount > 0 ? 1 : -1;
      incrementFields.totalTransfer = amount;
      incrementFields.totalProfit = profitAmount;
    } else if (paymentMethod === 'cuenta_corriente') {
      // No incrementamos ventas, costo ni cantidad de ventas porque el dinero no entró
      incrementFields.totalCuentaCorriente = amount;
      // Al fiar, la ganancia es 0 porque no tenemos el dinero físico todavía
      incrementFields.totalProfit = 0;
    } else if (paymentMethod === 'pay_debt') {
      // Registrar un pago de deuda en la caja activa (incrementa caja y ganancias, no ventas)
      incrementFields.totalCash = amount;
      incrementFields.totalDebtPayments = amount;
      incrementFields.totalProfit = profitAmount;
    }

    await CashRegister.findByIdAndUpdate(cashRegisterId, {
      $inc: incrementFields
    });
  }

  async updateCashMovementTotals(cashRegisterId: string, type: 'retiro' | 'ingreso', amount: number): Promise<void> {
    const incrementFields: Record<string, number> = {};
    
    if (type === 'retiro') {
      incrementFields.totalWithdrawals = amount;
    } else {
      incrementFields.totalDeposits = amount;
    }

    await CashRegister.findByIdAndUpdate(cashRegisterId, {
      $inc: incrementFields
    });
  }

  private toDto(cashRegister: ICashRegister): CashRegisterDto {
    // Calcular efectivo esperado
    const expectedCash = cashRegister.initialCash + cashRegister.totalCash + (cashRegister.totalDebtPayments || 0) - (cashRegister.totalWithdrawals || 0) + (cashRegister.totalDeposits || 0);
    const difference = cashRegister.finalCash !== undefined && cashRegister.finalCash !== null ? cashRegister.finalCash - expectedCash : undefined;

    // Obtener ID de usuario de forma segura (soporta string u objeto populado)
    const userIdStr = cashRegister.user && (cashRegister.user as any)._id
      ? (cashRegister.user as any)._id.toString()
      : cashRegister.user && (cashRegister.user as any).id
        ? (cashRegister.user as any).id.toString()
        : cashRegister.user.toString();

    return {
      id: cashRegister._id.toString(),
      user: userIdStr,
      status: cashRegister.status,
      openedAt: cashRegister.openedAt,
      closedAt: cashRegister.closedAt,
      initialCash: cashRegister.initialCash,
      finalCash: cashRegister.finalCash,
      totalWithdrawals: cashRegister.totalWithdrawals || 0,
      totalDeposits: cashRegister.totalDeposits || 0,
      cashCounted: cashRegister.cashCounted,
      denominationCount: cashRegister.denominationCount,
      totalCash: cashRegister.totalCash,
      totalTransfer: cashRegister.totalTransfer,
      totalCuentaCorriente: cashRegister.totalCuentaCorriente,
      totalDebtPayments: cashRegister.totalDebtPayments || 0,
      totalSales: cashRegister.totalSales,
      totalCost: cashRegister.totalCost || 0,
      totalProfit: cashRegister.totalProfit || 0,
      salesCount: cashRegister.salesCount,
      expectedCash: parseFloat(expectedCash.toFixed(2)),
      difference: difference !== undefined ? parseFloat(difference.toFixed(2)) : undefined,
      notes: cashRegister.notes,
      createdAt: cashRegister.createdAt,
      updatedAt: cashRegister.updatedAt,
    };
  }
}
