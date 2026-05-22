import { IProduct, Product } from '../models/Product.model';
import { injectable } from 'tsyringe';
import { CreateProductCommand, UpdateProductCommand, ProductDto, PaginatedProductsDto } from '../types/IProduct.types';
import { analyzeProductPricing, normalizeWeightProductCost } from '../utils/productPricing';
import { roundWeightKg } from '../utils/formatQuantity';

//interfaz de repositorio de productos
interface IProductRepository {
  createProduct(command: CreateProductCommand): Promise<ProductDto>;
  getProductById(id: string): Promise<ProductDto | null>;
  getAllProducts(page?: number, limit?: number, status?: string): Promise<PaginatedProductsDto>;
  updateProduct(id: string, command: UpdateProductCommand): Promise<ProductDto | null>;
  deleteProduct(id: string): Promise<void>;
  increaseStock(id: string, quantity: number): Promise<ProductDto | null>;
  decreaseStock(id: string, quantity: number): Promise<ProductDto | null>;
  deactivateProduct(id: string): Promise<ProductDto | null>;
}

@injectable()
export class ProductRepository implements IProductRepository {
  async createProduct(command: CreateProductCommand): Promise<ProductDto> {
    const normalized = this.normalizeCommand(command);
    const product = new Product(normalized);
    await product.save();
    return this.toDto(product);
  }

  async getProductById(id: string): Promise<ProductDto | null> {
    const product = await Product.findById(id);
    return product ? this.toDto(product) : null;
  }

  async getAllProducts(page: number = 1, limit: number = 10, status?: string): Promise<PaginatedProductsDto> {
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    
    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Product.countDocuments(filter)
    ]);
    
    const pages = Math.ceil(total / limit);
    
    return {
      products: products.map(product => this.toDto(product)),
      pagination: {
        total,
        page,
        limit,
        pages
      }
    };
  }

  async getAllProductsSinPage(): Promise<ProductDto[]> {
    const products = await Product.find().sort({ createdAt: -1 });
    return products.map(product => this.toDto(product));
  }

  async updateProduct(id: string, command: UpdateProductCommand): Promise<ProductDto | null> {
    const normalized = this.normalizeCommand(command);
    const currentProduct = await Product.findById(id);
    if (!currentProduct) return null;

    if (normalized.price !== undefined && normalized.price !== currentProduct.price) {
      (normalized as any).lastPriceUpdate = new Date();
    }
    if (normalized.stock !== undefined && normalized.stock !== currentProduct.stock) {
      (normalized as any).lastStockUpdate = new Date();
    }

    const product = await Product.findByIdAndUpdate(id, normalized, { new: true });
    return product ? this.toDto(product) : null;
  }

  private normalizeCommand(command: CreateProductCommand | UpdateProductCommand): typeof command {
    let result = { ...command };
    const unitType = result.unitType;
    const price = result.price;
    let stock = result.stock;
    const costPrice = result.costPrice;

    if (unitType === 'kilogramo' && stock !== undefined) {
      result = { ...result, stock: roundWeightKg(stock) };
      stock = result.stock;
    }

    if (
      unitType === 'kilogramo' &&
      price !== undefined &&
      stock !== undefined &&
      costPrice !== undefined
    ) {
      const normalizedCost = normalizeWeightProductCost(
        unitType,
        price,
        costPrice,
        stock
      );
      if (normalizedCost !== undefined && normalizedCost !== costPrice) {
        result = { ...result, costPrice: normalizedCost };
      }
    }
    return result;
  }

  async deleteProduct(id: string): Promise<void> {
    await Product.findByIdAndDelete(id);
  }

  async increaseStock(id: string, quantity: number): Promise<ProductDto | null> {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }
    const product = await Product.findByIdAndUpdate(
      id,
      { 
        $inc: { stock: quantity },
        $set: { lastStockUpdate: new Date() }
      },
      { new: true }
    );
    return product ? this.toDto(product) : null;
  }

  async decreaseStock(id: string, quantity: number): Promise<ProductDto | null> {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }
    const product = await Product.findById(id);
    if (!product) {
      return null;
    }
    if (product.stock < quantity) {
      throw new Error('No hay suficiente stock disponible');
    }
    product.stock -= quantity;
    product.lastStockUpdate = new Date();
    await product.save();
    return this.toDto(product);
  }

  async deactivateProduct(id: string): Promise<ProductDto | null> {
    const product = await Product.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );
    return product ? this.toDto(product) : null;
  }

  async getOneProductByNameOrCode(nameOrCode: string): Promise<ProductDto | null> {
    const product = await Product.findOne({
      $or: [
        { name: nameOrCode },
        { code: nameOrCode }
      ]
    });
    return product ? this.toDto(product) : null;
  }

  async searchProductsByQuery(query: string): Promise<ProductDto[]> {
    // Escape special regex characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const products = await Product.find({
      $or: [
        { name: { $regex: '^' + escapedQuery, $options: 'i' } },
        { code: { $regex: '^' + escapedQuery, $options: 'i' } }
      ]
    }).sort({ name: 1 });
    
    return products.map(product => this.toDto(product));
  }

  private toDto(product: IProduct): ProductDto {
    const pricing = analyzeProductPricing({
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
      unitType: product.unitType,
    });

    return {
      id: product._id.toString(),
      name: product.name,
      code: product.code,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
      unitType: product.unitType,
      category: product.category,
      active: product.active,
      status: product.status,
      profit: pricing.profitPerUnit,
      profitMargin: pricing.marginPct,
      lastPriceUpdate: product.lastPriceUpdate,
      lastStockUpdate: product.lastStockUpdate,
      createdAt: product.createdAt,
    };
  }
}
