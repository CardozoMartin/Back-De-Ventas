import { ISale, Sale, PaymentMethod, SaleStatus } from '../models/Sale.model';
import { ISaleDetail, SaleDetail } from '../models/SaleDetail.model';
import { Product } from '../models/Product.model';
import { Promotion, IPromotion } from '../models/PromotionProducts.model';
import { Client } from '../models/Client.model';
import { CashRegisterRepository } from './CashRegister.repository';
import { injectable } from 'tsyringe';
import { Types } from 'mongoose';
import mongoose from 'mongoose';
import { CreateSaleCommand, UpdateSaleCommand, SaleDto, SaleDetailDto, PaginatedSalesResponse } from '../types/ISale.types';
import { normalizeWeightProductCost } from '../utils/productPricing';
import { roundWeightKg } from '../utils/formatQuantity';

interface ISaleRepository {
  createSale(command: CreateSaleCommand): Promise<SaleDto>;
  getSaleById(id: string): Promise<SaleDto | null>;
  getAllSales(page?: number, limit?: number): Promise<PaginatedSalesResponse>;
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

    const promotionQuantity = Math.max(1, command.promotionQuantity ?? 1);

    // Si viene promotionId, procesar la promoción
    if (command.promotionId) {
      promotion = await Promotion.findById(command.promotionId).populate('items.product');
      
      if (!promotion) {
        throw new Error(`Promoción con ID ${command.promotionId} no encontrada`);
      }

      if (!promotion.active) {
        throw new Error('La promoción no está activa');
      }

      if (promotion.stock !== undefined && promotion.stock < promotionQuantity) {
        throw new Error(`No hay stock disponible de esta promoción. Disponible: ${promotion.stock}, Requerido: ${promotionQuantity}`);
      }

      // Procesar los items de la promoción
      for (const item of promotion.items) {
        const product = item.product as any;
        const requiredQty = item.quantity * promotionQuantity;
        
        if (!product || !product._id) {
          throw new Error(`Producto en la promoción no encontrado`);
        }

        if (!product.active) {
          throw new Error(`El producto ${product.name} no está activo`);
        }

        if (product.stock < requiredQty) {
          throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Requerido: ${requiredQty}`);
        }

        productsData.push({
          product,
          quantity: requiredQty,
          isSalePrice: true,
          unitPrice: item.snapshotPrice,
          costPrice: product.costPrice,
        });
      }

      total = promotion.promoPrice * promotionQuantity;
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

    if (command.paymentMethod === 'cuenta_corriente') {
      if (!command.clientId) {
        throw new Error('Debe seleccionar un cliente para realizar una venta al fiado (Cuenta Corriente)');
      }
      
      const clientExists = await Client.findById(command.clientId);
      if (!clientExists) {
        throw new Error('El cliente seleccionado no existe');
      }

      if (!clientExists.active) {
        throw new Error('El cliente seleccionado se encuentra inactivo');
      }

      // Validar límite de crédito
      if (clientExists.maxCredit && clientExists.maxCredit > 0) {
        const potentialDebt = Number(clientExists.debt || 0) + total;
        if (potentialDebt > clientExists.maxCredit) {
          throw new Error(`Crédito insuficiente. Límite: $${clientExists.maxCredit}, Deuda actual: $${clientExists.debt}, Esta compra: $${total}`);
        }
      }
    }

    // =====================================================================
    // TRANSACCIÓN: Todo lo que modifica datos se ejecuta atómicamente
    // Si algo falla, se revierte TODO (sale, details, stock, caja, deuda)
    // =====================================================================
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Crear la venta
      const sale = new Sale({
        seller: new Types.ObjectId(command.seller),
        cashRegister: new Types.ObjectId(openCashRegister.id),
        promotion: promotion ? new Types.ObjectId(promotion._id) : undefined,
        client: command.clientId ? new Types.ObjectId(command.clientId) : undefined,
        total,
        status,
        paymentMethod: command.paymentMethod,
        notes: command.notes,
      });
      await sale.save({ session });

      // Si es cuenta corriente, sumamos la deuda al cliente
      if (command.paymentMethod === 'cuenta_corriente' && command.clientId) {
        await Client.findByIdAndUpdate(command.clientId, {
          $inc: { debt: total }
        }, { session });
      }

      // Crear los detalles de la venta
      const saleDetails = await Promise.all(
        productsData.map(async (item) => {
          const unitPrice = item.unitPrice || item.product.price;
          const rawCost = item.costPrice ?? item.product.costPrice ?? 0;
          const costPrice =
            normalizeWeightProductCost(
              item.product.unitType,
              unitPrice,
              rawCost,
              item.product.stock
            ) ?? rawCost;
          
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
          await saleDetail.save({ session });
          return saleDetail;
        })
      );

      // En promociones: repartir el precio cobrado (promoPrice) entre líneas
      if (promotion) {
        await this.applyPromotionRevenue(saleDetails, total, session);
      }

      // Descontar el stock de los productos
      await Promise.all(
        productsData.map(async (item) => {
          if (item.product.unitType === 'kilogramo') {
            item.product.stock = roundWeightKg(item.product.stock - item.quantity);
          } else {
            item.product.stock -= item.quantity;
          }
          await item.product.save({ session });
        })
      );

      // Si fue una venta de promoción, descontar el stock de la promoción
      if (promotion) {
        if (promotion.stock !== undefined) {
          promotion.stock -= promotionQuantity;
          await promotion.save({ session });
        }
      }

      const totalCost = parseFloat(
        saleDetails.reduce((sum, detail) => sum + detail.costPrice * detail.quantity, 0).toFixed(2)
      );
      const totalProfit = parseFloat((total - totalCost).toFixed(2));

      // Actualizar los totales de la caja registradora
      await this.cashRegisterRepository.updateTotals(
        openCashRegister.id,
        command.paymentMethod,
        total,
        totalCost,
        totalProfit
      );

      // Commit de la transacción
      await session.commitTransaction();

      return this.toDto(sale, saleDetails);
    } catch (error) {
      // Rollback de la transacción
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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

  async getAllSales(page?: number, limit?: number): Promise<PaginatedSalesResponse> {
    const query = Sale.find();
    
    // Contar total de registros
    const totalRecords = await Sale.countDocuments();
    
    let salesQuery = query
      .populate({
        path: 'seller',
        select: 'name email'
      })
      .populate({
        path: 'cashRegister'
      })
      .sort({ createdAt: -1 });

    const currentPage = page || 1;
    let actualLimit = limit || totalRecords; // Si no hay límite, trae todos
    
    // Si hay paginación y limite, aplicar
    if (page && limit) {
      const skip = (page - 1) * limit;
      salesQuery = salesQuery.skip(skip).limit(limit);
    }

    const sales = await salesQuery.lean();

    // Obtener todos los detalles de una sola vez
    const salesIds = sales.map(s => s._id);
    const allDetails = await SaleDetail.find({ sale: { $in: salesIds } })
      .populate('product', 'name')
      .lean();

    // Mapear detalles por venta
    const detailsByVentaId: { [key: string]: typeof allDetails } = {};
    allDetails.forEach(detail => {
      const ventaId = detail.sale.toString();
      if (!detailsByVentaId[ventaId]) {
        detailsByVentaId[ventaId] = [];
      }
      detailsByVentaId[ventaId].push(detail);
    });

    // Convertir a DTO
    const salesDto = sales.map(sale => 
      this.toDto(sale as any, detailsByVentaId[sale._id.toString()] || [])
    );

    return {
      sales: salesDto,
      totalRecords,
      totalPages: limit ? Math.ceil(totalRecords / limit) : 1,
      currentPage
    };
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
          if (product.unitType === 'kilogramo') {
            product.stock = roundWeightKg(product.stock + detail.quantity);
          } else {
            product.stock += detail.quantity;
          }
          await product.save();
        }
      })
    );

    // Si fue venta a cuenta corriente, restaurar la deuda del cliente
    if (sale.paymentMethod === 'cuenta_corriente' && sale.client) {
      await Client.findByIdAndUpdate(sale.client, {
        $inc: { debt: -sale.total }
      });
    }

    // Si fue una venta de promoción, devolver el stock de la promoción
    if (sale.promotion) {
      const promotion = await Promotion.findById(sale.promotion);
      if (promotion && promotion.stock !== undefined) {
        // Calcular cuántas promociones se vendieron basado en los items del pack
        let promotionQuantity = 1;
        if (promotion.items.length > 0 && details.length > 0) {
          const firstPromoItem = promotion.items[0];
          const matchingDetail = details.find(
            d => d.product.toString() === firstPromoItem.product.toString()
          );
          if (matchingDetail && firstPromoItem.quantity > 0) {
            promotionQuantity = Math.round(matchingDetail.quantity / firstPromoItem.quantity);
          }
        }
        promotion.stock += Math.max(1, promotionQuantity);
        await promotion.save();
      }
    }

    sale.status = 'cancelado';
    await sale.save();

    const cancelTotalCost = parseFloat(
      details.reduce((sum, detail) => sum + detail.costPrice * detail.quantity, 0).toFixed(2)
    );
    const cancelTotalProfit = parseFloat((sale.total - cancelTotalCost).toFixed(2));

    // Actualizar los totales de la caja registradora (restar)
    const cashRegisterId = sale.cashRegister.toString();
    await this.cashRegisterRepository.updateTotals(
      cashRegisterId,
      sale.paymentMethod,
      -sale.total, // Monto negativo para restar
      -cancelTotalCost,
      -cancelTotalProfit
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

  /**
   * Reparte el monto cobrado de la promoción entre los productos del pack
   * (proporcional al snapshotPrice × cantidad de cada línea).
   */
  private async applyPromotionRevenue(
    saleDetails: ISaleDetail[],
    promoTotal: number,
    session?: mongoose.ClientSession
  ): Promise<void> {
    const referenceTotal = saleDetails.reduce(
      (sum, detail) => sum + detail.unitPrice * detail.quantity,
      0
    );

    let assignedRevenue = 0;

    for (let i = 0; i < saleDetails.length; i++) {
      const detail = saleDetails[i];
      const isLast = i === saleDetails.length - 1;
      const lineReference =
        referenceTotal > 0
          ? (detail.unitPrice * detail.quantity) / referenceTotal
          : 1 / saleDetails.length;
      const lineRevenue = isLast
        ? parseFloat((promoTotal - assignedRevenue).toFixed(2))
        : parseFloat((promoTotal * lineReference).toFixed(2));
      assignedRevenue += lineRevenue;

      const unitPrice = parseFloat((lineRevenue / detail.quantity).toFixed(4));
      const lineCost = detail.costPrice * detail.quantity;

      detail.unitPrice = unitPrice;
      detail.subtotal = lineRevenue;
      detail.profit = parseFloat((lineRevenue - lineCost).toFixed(2));
      await detail.save(session ? { session } : undefined);
    }
  }

  private toDto(sale: ISale, details?: any[]): SaleDto {
    const detailsDto = details?.map(detail => this.detailToDto(detail));
    const totalCost =
      detailsDto?.reduce((sum, detail) => sum + detail.costPrice * detail.quantity, 0) || 0;
    const totalProfit = parseFloat((sale.total - totalCost).toFixed(2));
    
    return {
      id: sale._id.toString(),
      seller: (sale.seller as any).name ? (sale.seller as any).name : sale.seller.toString(),
      cashRegister: sale.cashRegister.toString(),
      promotion: sale.promotion ? sale.promotion.toString() : undefined,
      client: sale.client ? sale.client.toString() : undefined,
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

  private detailToDto(detail: any): SaleDetailDto {
    let productId = '';
    if (detail.product) {
      if (typeof detail.product === 'object') {
        productId = detail.product._id ? detail.product._id.toString() : '';
      } else {
        productId = detail.product.toString();
      }
    }

    return {
      id: detail._id.toString(),
      sale: detail.sale.toString(),
      product: productId,
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
