import { injectable } from "tsyringe";
import { ProductRepository } from "../repository/Product.repository";
import { CreateProductCommand, UpdateProductCommand, ProductDto } from "../types/IProduct.types";

@injectable()
export class ProductService {
  constructor(private productRepository: ProductRepository) { }

  async createProduct(command: CreateProductCommand): Promise<ProductDto> {
    return this.productRepository.createProduct(command);
  }

  async getProductById(id: string): Promise<ProductDto | null> {
    return this.productRepository.getProductById(id);
  }

  async getAllProducts(): Promise<ProductDto[]> {
    return this.productRepository.getAllProducts();
  }

  async updateProduct(id: string, command: UpdateProductCommand): Promise<ProductDto | null> {
    return this.productRepository.updateProduct(id, command);
  }

  async deleteProduct(id: string): Promise<void> {
    return this.productRepository.deleteProduct(id);
  }

  async increaseStock(id: string, quantity: number): Promise<ProductDto | null> {
    return this.productRepository.increaseStock(id, quantity);
  }

  async decreaseStock(id: string, quantity: number): Promise<ProductDto | null> {
    return this.productRepository.decreaseStock(id, quantity);
  }

  async deactivateProduct(id: string): Promise<ProductDto | null> {
    return this.productRepository.deactivateProduct(id);
  }
}
