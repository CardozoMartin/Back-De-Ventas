import { injectable } from "tsyringe";
import { PromotionRepository } from "../repository/PromotionProducts.repository";
import { CreatePromotionCommand, UpdatePromotionCommand, PromotionDto } from "../types/IPromotionProducts.types";
import { AuditService } from "./Audit.service";

@injectable()
export class PromotionService {
  constructor(private promotionRepository: PromotionRepository, private auditService: AuditService) { }

  async createPromotion(command: CreatePromotionCommand, userId: string, ip?: string): Promise<PromotionDto> {
    const promotion = await this.promotionRepository.createPromotion(command);

    // Registrar auditoría
    await this.auditService.createAudit({
      user: userId,
      action: "CREATE",
      entity: "Promotion",
      entityId: promotion.id,
      description: `Promoción creada: ${promotion.name} - Tipo: ${promotion.type} - Precio: $${promotion.promoPrice}`,
      changes: {
        after: {
          name: promotion.name,
          type: promotion.type,
          promoPrice: promotion.promoPrice,
          originalPrice: promotion.originalPrice,
          active: promotion.active,
          itemsCount: promotion.items.length
        }
      },
      ip
    });

    return promotion;
  }

  async getPromotionById(id: string): Promise<PromotionDto | null> {
    return this.promotionRepository.getPromotionById(id);
  }

  async getAllPromotions(page?: number, limit?: number) {
    return this.promotionRepository.getAllPromotions(page, limit);
  }

  async getAllPromotionsSinPage(): Promise<PromotionDto[]> {
    return this.promotionRepository.getAllPromotionsSinPage();
  }

  async getActivePromotions(page?: number, limit?: number) {
    return this.promotionRepository.getActivePromotions(page, limit);
  }

  async updatePromotion(id: string, command: UpdatePromotionCommand, userId: string, ip?: string): Promise<PromotionDto | null> {
    // Obtener la promoción antes de actualizarla
    const promotionBefore = await this.promotionRepository.getPromotionById(id);

    if (!promotionBefore) {
      return null;
    }

    const promotionAfter = await this.promotionRepository.updatePromotion(id, command);

    if (promotionAfter) {
      // Registrar auditoría
      await this.auditService.createAudit({
        user: userId,
        action: "UPDATE",
        entity: "Promotion",
        entityId: promotionAfter.id,
        description: `Promoción actualizada: ${promotionAfter.name}`,
        changes: {
          before: {
            name: promotionBefore.name,
            type: promotionBefore.type,
            promoPrice: promotionBefore.promoPrice,
            originalPrice: promotionBefore.originalPrice,
            active: promotionBefore.active,
            itemsCount: promotionBefore.items.length
          },
          after: {
            name: promotionAfter.name,
            type: promotionAfter.type,
            promoPrice: promotionAfter.promoPrice,
            originalPrice: promotionAfter.originalPrice,
            active: promotionAfter.active,
            itemsCount: promotionAfter.items.length
          }
        },
        ip
      });
    }

    return promotionAfter;
  }

  async deletePromotion(id: string, userId: string, ip?: string): Promise<void> {
    // Obtener la promoción antes de eliminarla
    const promotion = await this.promotionRepository.getPromotionById(id);

    if (promotion) {
      await this.promotionRepository.deletePromotion(id);

      // Registrar auditoría
      await this.auditService.createAudit({
        user: userId,
        action: "DELETE",
        entity: "Promotion",
        entityId: promotion.id,
        description: `Promoción eliminada: ${promotion.name}`,
        changes: {
          before: {
            name: promotion.name,
            type: promotion.type,
            promoPrice: promotion.promoPrice,
            originalPrice: promotion.originalPrice,
            itemsCount: promotion.items.length
          }
        },
        ip
      });
    }
  }

  async increaseStock(id: string, quantity: number, userId: string, ip?: string): Promise<PromotionDto | null> {
    // Obtener el stock anterior
    const promotionBefore = await this.promotionRepository.getPromotionById(id);

    if (!promotionBefore) {
      return null;
    }

    const promotionAfter = await this.promotionRepository.increaseStock(id, quantity);

    if (promotionAfter) {
      // Registrar auditoría
      await this.auditService.createAudit({
        user: userId,
        action: "UPDATE",
        entity: "Promotion",
        entityId: promotionAfter.id,
        description: `Stock aumentado: ${promotionAfter.name} (+${quantity} unidades)`,
        changes: {
          before: { stock: promotionBefore.stock || 0 },
          after: { stock: promotionAfter.stock || 0 }
        },
        ip
      });
    }

    return promotionAfter;
  }

  async decreaseStock(id: string, quantity: number, userId: string, ip?: string): Promise<PromotionDto | null> {
    // Obtener el stock anterior
    const promotionBefore = await this.promotionRepository.getPromotionById(id);

    if (!promotionBefore) {
      return null;
    }

    const promotionAfter = await this.promotionRepository.decreaseStock(id, quantity);

    if (promotionAfter) {
      // Registrar auditoría
      await this.auditService.createAudit({
        user: userId,
        action: "UPDATE",
        entity: "Promotion",
        entityId: promotionAfter.id,
        description: `Stock disminuido: ${promotionAfter.name} (-${quantity} unidades)`,
        changes: {
          before: { stock: promotionBefore.stock || 0 },
          after: { stock: promotionAfter.stock || 0 }
        },
        ip
      });
    }

    return promotionAfter;
  }

  async deactivatePromotion(id: string, userId: string, ip?: string): Promise<PromotionDto | null> {
    // Obtener la promoción antes de desactivarla
    const promotionBefore = await this.promotionRepository.getPromotionById(id);

    if (!promotionBefore) {
      return null;
    }

    const promotionAfter = await this.promotionRepository.deactivatePromotion(id);

    if (promotionAfter) {
      // Registrar auditoría
      await this.auditService.createAudit({
        user: userId,
        action: "UPDATE",
        entity: "Promotion",
        entityId: promotionAfter.id,
        description: `Promoción desactivada: ${promotionAfter.name}`,
        changes: {
          before: { active: promotionBefore.active },
          after: { active: promotionAfter.active }
        },
        ip
      });
    }

    return promotionAfter;
  }
}
