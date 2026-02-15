import { Promotion, IPromotion } from '../models/PromotionProducts.model';
import { injectable } from 'tsyringe';
import { CreatePromotionCommand, UpdatePromotionCommand, PromotionDto, PaginatedPromotionsDto } from '../types/IPromotionProducts.types';

// Interfaz de repositorio de promociones
interface IPromotionRepository {
  createPromotion(command: CreatePromotionCommand): Promise<PromotionDto>;
  getPromotionById(id: string): Promise<PromotionDto | null>;
  getAllPromotions(page?: number, limit?: number): Promise<PaginatedPromotionsDto>;
  getAllPromotionsSinPage(): Promise<PromotionDto[]>;
  updatePromotion(id: string, command: UpdatePromotionCommand): Promise<PromotionDto | null>;
  deletePromotion(id: string): Promise<void>;
  increaseStock(id: string, quantity: number): Promise<PromotionDto | null>;
  decreaseStock(id: string, quantity: number): Promise<PromotionDto | null>;
  deactivatePromotion(id: string): Promise<PromotionDto | null>;
  getActivePromotions(page?: number, limit?: number): Promise<PaginatedPromotionsDto>;
}

@injectable()
export class PromotionRepository implements IPromotionRepository {
  async createPromotion(command: CreatePromotionCommand): Promise<PromotionDto> {
    const promotion = new Promotion(command);
    await promotion.save();
    return this.toDto(promotion);
  }

  async getPromotionById(id: string): Promise<PromotionDto | null> {
    const promotion = await Promotion.findById(id).populate('items.product');
    return promotion ? this.toDto(promotion) : null;
  }

  async getAllPromotions(page: number = 1, limit: number = 10): Promise<PaginatedPromotionsDto> {
    const skip = (page - 1) * limit;

    const [promotions, total] = await Promise.all([
      Promotion.find().populate('items.product').skip(skip).limit(limit).sort({ createdAt: -1 }),
      Promotion.countDocuments()
    ]);

    const pages = Math.ceil(total / limit);

    return {
      promotions: promotions.map(promotion => this.toDto(promotion)),
      pagination: {
        total,
        page,
        limit,
        pages
      }
    };
  }

  async getAllPromotionsSinPage(): Promise<PromotionDto[]> {
    const promotions = await Promotion.find().populate('items.product').sort({ createdAt: -1 });
    return promotions.map(promotion => this.toDto(promotion));
  }

  async updatePromotion(id: string, command: UpdatePromotionCommand): Promise<PromotionDto | null> {
    const promotion = await Promotion.findByIdAndUpdate(id, command, { new: true }).populate('items.product');
    return promotion ? this.toDto(promotion) : null;
  }

  async deletePromotion(id: string): Promise<void> {
    await Promotion.findByIdAndDelete(id);
  }

  async increaseStock(id: string, quantity: number): Promise<PromotionDto | null> {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }
    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { $inc: { stock: quantity } },
      { new: true }
    ).populate('items.product');
    return promotion ? this.toDto(promotion) : null;
  }

  async decreaseStock(id: string, quantity: number): Promise<PromotionDto | null> {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }
    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return null;
    }
    if (promotion.stock && promotion.stock < quantity) {
      throw new Error('No hay suficiente stock disponible');
    }
    if (promotion.stock) {
      promotion.stock -= quantity;
    }
    await promotion.save();
    await promotion.populate('items.product');
    return this.toDto(promotion);
  }

  async deactivatePromotion(id: string): Promise<PromotionDto | null> {
    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    ).populate('items.product');
    return promotion ? this.toDto(promotion) : null;
  }

  async getActivePromotions(page: number = 1, limit: number = 10): Promise<PaginatedPromotionsDto> {
    const skip = (page - 1) * limit;
    const now = new Date();

    const [promotions, total] = await Promise.all([
      Promotion.find({
        active: true,
        $or: [
          { startsAt: { $lte: now }, endsAt: { $gte: now } },
          { startsAt: null, endsAt: null }
        ]
      }).populate('items.product').skip(skip).limit(limit).sort({ createdAt: -1 }),
      Promotion.countDocuments({
        active: true,
        $or: [
          { startsAt: { $lte: now }, endsAt: { $gte: now } },
          { startsAt: null, endsAt: null }
        ]
      })
    ]);

    const pages = Math.ceil(total / limit);

    return {
      promotions: promotions.map(promotion => this.toDto(promotion)),
      pagination: {
        total,
        page,
        limit,
        pages
      }
    };
  }

  private toDto(promotion: IPromotion): PromotionDto {
    // Calcular savings y discountPercentage
    const savings = promotion.originalPrice - promotion.promoPrice;
    const discountPercentage = promotion.originalPrice > 0 
      ? Math.round(((promotion.originalPrice - promotion.promoPrice) / promotion.originalPrice) * 100)
      : 0;

    return {
      id: promotion._id.toString(),
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      items: promotion.items,
      promoPrice: promotion.promoPrice,
      originalPrice: promotion.originalPrice,
      savings,
      discountPercentage,
      active: promotion.active,
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      stock: promotion.stock,
      createdAt: promotion.createdAt,
      updatedAt: promotion.updatedAt,
    };
  }
}
