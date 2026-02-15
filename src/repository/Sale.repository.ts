import { ISale, Sale, PaymentMethod, SaleStatus } from '../models/Sale.model';
import { ISaleDetail, SaleDetail } from '../models/SaleDetail.model';
import { Product } from '../models/Product.model';
import { Promotion, IPromotion } from '../models/PromotionProducts.model';
import { CashRegisterRepository } from './CashRegister.repository';
import { injectable } from 'tsyringe';
import { Types } from 'mongoose';
import { CreateSaleCommand, UpdateSaleCommand, SaleDto, SaleDetailDto } from '../types/ISale.types';

interface ISaleRepository {
  createSale(command: CreateSaleCommand): Promise<SaleDto>;
  getSaleById(id: string): Promise<SaleDto | null>;
  getAllSales(): Promise<SaleDto[]>;
  getSalesBySeller(sellerId: string): Promise<SaleDto[]>;
  getSalesByCashRegister(cashRegisterId: string): Promise<SaleDto[]>;
  updateSale(id: string, command: UpdateSaleCommand): Promise<SaleDto | null>;
  cancelSale(id: string): Promise<SaleDto | null>;
  completeSale(id: string): Promise<SaleDto | null>;
}

@injectable()
export class SaleRepository implements ISaleRepository {
  
  constructor(private cashRegisterRepository: CashRegisterRepository) { }
  
  async createSale(command: CreateSaleCommand): Promise<SaleDto> {
    // Validar que hay detalles o promoting
    if ((!command.details || command.details.length === 0) && !command.promotionId) {
      throw new Error('La venta debe tener al menos un producto o una promoción');
    }

    // Verificar que existe una caja abierta
    const openCashRegister = await this.cashRegisterRepository.getOpenCashRegister();
    if (!openCashRegister) {
      throw new Error('No hay una caja abierta. Debe abrir una caja antes de realizar ventas');
    }

    let productsData: Array<{ product: any; quantity: number; isSalePrice?: boolean; unitPrice?: number; costPrice?: number }> = [];
    let total: number = 0;
    let promotion: IPromotion | null = null;

    // Si viene promotionId, procesar la promoción
    if (command.promotionId) {
      promotion = await Promotion.findById(command.promotionId).populate('items.product');
      
      if (!promotion) {
        throw new Error(`Promoción con ID ${command.promotionId} no encontrada`);
      }

      if (!promotion.active) {
        throw new Error('La promoción no está activa');
      }

      if (promotion.stock !== undefined && promotion.stock < 1) {
        throw new Error('No hay stock disponible de esta promoción');
      }

      // Procesar los items de la promoción
      for (const item of promotion.items) {
        const product = item.product as any;
        
        if (!product || !product._id) {
          throw new Error(`Producto en la promoción no encontrado`);
        }

        if (!product.active) {
          throw new Error(`El producto ${product.name} no está activo`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Requerido: ${item.quantity}`);
        }

        productsData.push({
          product,
          quantity: item.quantity,
          isSalePrice: true,
          unitPrice: item.snapshotPrice,
          costPrice: product.costPrice,
        });
      }

      total = promotion.promoPrice;
    } else {
      // Procesar detalles normales
      if (!command.details || command.details.length === 0) {
        throw new Error('La venta debe tener al menos un producto');
      }

      const productsDataTemp = await Promise.all(
        command.details.map(async (detail) => {
          const product = await Product.findById(detail.productId);
          if (!product) {
            throw new Error(`Producto con ID ${detail.productId} no encontrado`);
          }
          if (!product.active) {
            throw new Error(`El producto ${product.name} no está activo`);
          }
          if (product.stock < detail.quantity) {
            throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${detail.quantity}`);
          }
          return {
            product,
            quantity: detail.quantity,
          };
        })
      );
      productsData = productsDataTemp;

      // Calcular el total
      total = productsData.reduce((sum, item) => {
        return sum + ((item.unitPrice || item.product.price) * item.quantity);
      }, 0);
    }

    // Determinar el estado según el método de pago
    let status: SaleStatus = 'pendiente';
    if (command.paymentMethod === 'efectivo' || command.paymentMethod === 'transferencia') {
      status = 'pagado';
    }

    // Crear la venta
    const sale = new Sale({
      seller: new Types.ObjectId(command.seller),
      cashRegister: new Types.ObjectId(openCashRegister.id),
      promotion: promotion ? new Types.ObjectId(promotion._id) : undefined,
      total,
      status,
      paymentMethod: command.paymentMethod,
      notes: command.notes,
    });
    await sale.save();

    // Crear los detalles de la venta
    const saleDetails = await Promise.all(
      productsData.map(async (item) => {
        const unitPrice = item.unitPrice || item.product.price;
        const costPrice = item.costPrice || item.product.costPrice;
        
        const saleDetail = new SaleDetail({
          sale: sale._id,
          product: item.product._id,
          productName: item.product.name,
          unitType: item.product.unitType,
          unitPrice,
          costPrice,
          quantity: item.quantity,
          subtotal: unitPrice * item.quantity,
          profit: (unitPrice - costPrice) * item.quantity,
        });
        await saleDetail.save();
        return saleDetail;
      })
    );

    // Descontar el stock de los productos
    await Promise.all(
      productsData.map(async (item) => {
        item.product.stock -= item.quantity;
        await item.product.save();
      })
    );

    // Si fue una venta de promoción, descontar el stock de la promoción
    if (promotion) {
      if (promotion.stock !== undefined) {
        promotion.stock -= 1;
        await promotion.save();
      }
    }

    // Actualizar los totales de la caja registradora
    await this.cashRegisterRepository.updateTotals(
      openCashRegister.id,
      command.paymentMethod,
      total
    );

    return this.toDto(sale, saleDetails);
  }

  async getSaleById(id: string): Promise<SaleDto | null> {
    const sale = await Sale.findById(id)
      .populate('seller', 'name email')
      .populate('cashRegister');
    
    if (!sale) {
      return null;
    }

    const details = await SaleDetail.find({ sale: sale._id })
      .populate('product', 'name');

    return this.toDto(sale, details);
  }

  async getAllSales(): Promise<SaleDto[]> {
    const sales = await Sale.find()
      .populate('seller', 'name email')
      .populate('cashRegister')
      .sort({ createdAt: -1 });

    const salesWithDetails = await Promise.all(
      sales.map(async (sale) => {
        const details = await SaleDetail.find({ sale: sale._id })
          .populate('product', 'name');
        return this.toDto(sale, details);
      })
    );

    return salesWithDetails;
  }

  async getSalesBySeller(sellerId: string): Promise<SaleDto[]> {
    const sales = await Sale.find({ seller: new Types.ObjectId(sellerId) })
      .populate('seller', 'name email')
      .populate('cashRegister')
      .sort({ createdAt: -1 });

    const salesWithDetails = await Promise.all(
      sales.map(async (sale) => {
        const details = await SaleDetail.find({ sale: sale._id })
          .populate('product', 'name');
        return this.toDto(sale, details);
      })
    );

    return salesWithDetails;
  }

  async getSalesByCashRegister(cashRegisterId: string): Promise<SaleDto[]> {
    const sales = await Sale.find({ cashRegister: new Types.ObjectId(cashRegisterId) })
      .populate('seller', 'name email')
      .populate('cashRegister')
      .sort({ createdAt: -1 });

    const salesWithDetails = await Promise.all(
      sales.map(async (sale) => {
        const details = await SaleDetail.find({ sale: sale._id })
          .populate('product', 'name');
        return this.toDto(sale, details);
      })
    );

    return salesWithDetails;
  }

  async updateSale(id: string, command: UpdateSaleCommand): Promise<SaleDto | null> {
    const sale = await Sale.findByIdAndUpdate(id, command, { new: true })
      .populate('seller', 'name email')
      .populate('cashRegister');
    
    if (!sale) {
      return null;
    }

    const details = await SaleDetail.find({ sale: sale._id })
      .populate('product', 'name');

    return this.toDto(sale, details);
  }

  async cancelSale(id: string): Promise<SaleDto | null> {
    const sale = await Sale.findById(id);
    
    if (!sale) {
      return null;
    }

    if (sale.status === 'cancelado') {
      throw new Error('La venta ya está cancelada');
    }

    // Devolver el stock de los productos
    const details = await SaleDetail.find({ sale: sale._id });
    await Promise.all(
      details.map(async (detail) => {
        const product = await Product.findById(detail.product);
        if (product) {
          product.stock += detail.quantity;
          await product.save();
        }
      })
    );

    // Si fue una venta de promoción, devolver el stock de la promoción
    if (sale.promotion) {
      const promotion = await Promotion.findById(sale.promotion);
      if (promotion && promotion.stock !== undefined) {
        promotion.stock += 1;
        await promotion.save();
      }
    }

    sale.status = 'cancelado';
    await sale.save();

    // Actualizar los totales de la caja registradora (restar)
    const cashRegisterId = sale.cashRegister.toString();
    await this.cashRegisterRepository.updateTotals(
      cashRegisterId,
      sale.paymentMethod,
      -sale.total // Monto negativo para restar
    );

    await sale.populate('seller', 'name email');
    await sale.populate('cashRegister');
    return this.toDto(sale, details);
  }

  async completeSale(id: string): Promise<SaleDto | null> {
    const sale = await Sale.findById(id);
    
    if (!sale) {
      return null;
    }

    if (sale.status === 'pagado') {
      throw new Error('La venta ya está pagada');
    }

    if (sale.status === 'cancelado') {
      throw new Error('No se puede completar una venta cancelada');
    }

    sale.status = 'pagado';
    await sale.save();

    await sale.populate('seller', 'name email');
    await sale.populate('cashRegister');
    const details = await SaleDetail.find({ sale: sale._id })
      .populate('product', 'name');

    return this.toDto(sale, details);
  }

  private toDto(sale: ISale, details?: ISaleDetail[]): SaleDto {
    const detailsDto = details?.map(detail => this.detailToDto(detail));
    const totalProfit = detailsDto?.reduce((sum, detail) => sum + (detail.profit || 0), 0) || 0;
    
    return {
      id: sale._id.toString(),
      seller: sale.seller.toString(),
      cashRegister: sale.cashRegister.toString(),
      promotion: sale.promotion ? sale.promotion.toString() : undefined,
      total: sale.total,
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      status: sale.status,
      paymentMethod: sale.paymentMethod,
      notes: sale.notes,
      details: detailsDto,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    };
  }

  private detailToDto(detail: ISaleDetail): SaleDetailDto {
    return {
      id: detail._id.toString(),
      sale: detail.sale.toString(),
      product: detail.product.toString(),
      productName: detail.productName,
      unitType: detail.unitType,
      unitPrice: detail.unitPrice,
      costPrice: detail.costPrice,
      quantity: detail.quantity,
      subtotal: detail.subtotal,
      profit: detail.profit,
      createdAt: detail.createdAt,
    };
  }
}
