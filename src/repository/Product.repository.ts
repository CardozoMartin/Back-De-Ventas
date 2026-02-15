import { IProduct, Product } from '../models/Product.model';
import { injectable } from 'tsyringe';
import { CreateProductCommand, UpdateProductCommand, ProductDto, PaginatedProductsDto } from '../types/IProduct.types';

//interfaz de repositorio de productos
interface IProductRepository {
  createProduct(command: CreateProductCommand): Promise<ProductDto>;
  getProductById(id: string): Promise<ProductDto | null>;
  getAllProducts(page?: number, limit?: number): Promise<PaginatedProductsDto>;
  updateProduct(id: string, command: UpdateProductCommand): Promise<ProductDto | null>;
  deleteProduct(id: string): Promise<void>;
  increaseStock(id: string, quantity: number): Promise<ProductDto | null>;
  decreaseStock(id: string, quantity: number): Promise<ProductDto | null>;
  deactivateProduct(id: string): Promise<ProductDto | null>;
}

@injectable()
export class ProductRepository implements IProductRepository {
  async createProduct(command: CreateProductCommand): Promise<ProductDto> {
    const product = new Product(command);
    await product.save();
    return this.toDto(product);
  }

  async getProductById(id: string): Promise<ProductDto | null> {
    const product = await Product.findById(id);
    return product ? this.toDto(product) : null;
  }

  async getAllProducts(page: number = 1, limit: number = 10): Promise<PaginatedProductsDto> {
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      Product.countDocuments()
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
    const product = await Product.findByIdAndUpdate(id, command, { new: true });
    return product ? this.toDto(product) : null;
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
      { $inc: { stock: quantity } },
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

  private toDto(product: IProduct): ProductDto {
    const profit = product.price - product.costPrice;
    const profitMargin = product.costPrice > 0 ? (profit / product.costPrice) * 100 : 0;
    
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
      profit: parseFloat(profit.toFixed(2)),
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      createdAt: product.createdAt,
    };
  }
}
