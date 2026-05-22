import { injectable } from "tsyringe";
import { SaleRepository } from "../repository/Sale.repository";
import { CreateSaleCommand, UpdateSaleCommand, SaleDto, PaginatedSalesResponse } from "../types/ISale.types";
import { AuditService } from "./Audit.services";

@injectable()
export class SaleService {
  constructor(
    private saleRepository: SaleRepository,
    private auditService: AuditService
  ) { }

  async createSale(command: CreateSaleCommand, userId: string, ip?: string): Promise<SaleDto> {
    // Agregar el seller al comando si no viene
    const fullCommand = {
      ...command,
      seller: userId,
    };
    
    const sale = await this.saleRepository.createSale(fullCommand);

    // Generar descripción basada en si es venta de promoción o no
    let description: string;
    if (sale.promotion) {
      description = `Venta de promoción: ${sale.details?.length || 0} producto(s) - Total: $${sale.total} - Método: ${sale.paymentMethod}`;
    } else {
      description = `Venta creada: ${sale.details?.length || 0} producto(s) - Total: $${sale.total} - Método: ${sale.paymentMethod}`;
    }
    
    // Registrar auditoría
    await this.auditService.createAudit({
      user: userId,
      action: "SALE_COMPLETED",
      entity: "Sale",
      entityId: sale.id,
      description,
      changes: {
        after: {
          total: sale.total,
          status: sale.status,
          paymentMethod: sale.paymentMethod,
          productsCount: sale.details?.length || 0,
          promotion: sale.promotion || 'N/A'
        }
      },
      ip
    });

    return sale;
  }

  async getSaleById(id: string): Promise<SaleDto | null> {
    return this.saleRepository.getSaleById(id);
  }

  async getAllSales(page?: number, limit?: number): Promise<PaginatedSalesResponse> {
    return this.saleRepository.getAllSales(page, limit);
  }

  async getSalesBySeller(sellerId: string): Promise<SaleDto[]> {
    return this.saleRepository.getSalesBySeller(sellerId);
  }

  async getSalesByCashRegister(cashRegisterId: string): Promise<SaleDto[]> {
    return this.saleRepository.getSalesByCashRegister(cashRegisterId);
  }

  async updateSale(id: string, command: UpdateSaleCommand, userId: string, ip?: string): Promise<SaleDto | null> {
    const saleBefore = await this.saleRepository.getSaleById(id);
    
    if (!saleBefore) {
      return null;
    }

    const saleAfter = await this.saleRepository.updateSale(id, command);
    
    if (saleAfter) {
      // Registrar auditoría
      await this.auditService.createAudit({
        user: userId,
        action: "UPDATE",
        entity: "Sale",
        entityId: saleAfter.id,
        description: `Venta actualizada - Total: $${saleAfter.total}`,
        changes: {
          before: {
            status: saleBefore.status,
            notes: saleBefore.notes
          },
          after: {
            status: saleAfter.status,
            notes: saleAfter.notes
          }
        },
        ip
      });
    }

    return saleAfter;
  }

  async cancelSale(id: string, userId: string, ip?: string): Promise<SaleDto | null> {
    const saleBefore = await this.saleRepository.getSaleById(id);
    
    if (!saleBefore) {
      return null;
    }

    const saleAfter = await this.saleRepository.cancelSale(id);
    
    if (saleAfter) {
      // Registrar auditoría
      await this.auditService.createAudit({
        user: userId,
        action: "DELETE",
        entity: "Sale",
        entityId: saleAfter.id,
        description: `Venta cancelada - Se devolvieron ${saleAfter.details?.length || 0} producto(s) al stock`,
        changes: {
          before: { status: saleBefore.status },
          after: { status: saleAfter.status }
        },
        ip
      });
    }

    return saleAfter;
  }

  async completeSale(id: string, userId: string, ip?: string): Promise<SaleDto | null> {
    const saleBefore = await this.saleRepository.getSaleById(id);
    
    if (!saleBefore) {
      return null;
    }

    const saleAfter = await this.saleRepository.completeSale(id);
    
    if (saleAfter) {
      // Registrar auditoría
      await this.auditService.createAudit({
        user: userId,
        action: "UPDATE",
        entity: "Sale",
        entityId: saleAfter.id,
        description: `Venta completada - Cambio de estado a pagado - Total: $${saleAfter.total}`,
        changes: {
          before: { status: saleBefore.status },
          after: { status: saleAfter.status }
        },
        ip
      });
    }

    return saleAfter;
  }
}
