import { injectable } from "tsyringe";
import { ProductRepository } from "../repository/Product.repository";
import { CreateProductCommand, UpdateProductCommand, ProductDto } from "../types/IProduct.types";
import { AuditService } from "./Audit.services";

@injectable()
export class ProductService {
  constructor(private productRepository: ProductRepository, private auditoriService:AuditService ) { }

  async createProduct(command: CreateProductCommand, userId: string, ip?: string): Promise<ProductDto> {

    const product = await this.productRepository.createProduct(command);
    
    // Registrar auditoría
    await this.auditoriService.createAudit({
      user: userId,
      action: "CREATE",
      entity: "Product",
      entityId: product.id,
      description: `Producto creado: ${product.name} (${product.category || 'Sin categoría'}) - Precio: $${product.price}, Stock: ${product.stock}`,
      changes: {
        after: {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          active: product.active
        }
      },
      ip
    });

    return product;
  }

  async getProductById(id: string): Promise<ProductDto | null> {
    return this.productRepository.getProductById(id);
  }

  async getAllProducts(page?: number, limit?: number) {
    return this.productRepository.getAllProducts(page, limit);
  }
   async getAllProductsSinPage(): Promise<ProductDto[]> {
    return this.productRepository.getAllProductsSinPage();
  }
  async updateProduct(id: string, command: UpdateProductCommand, userId: string, ip?: string): Promise<ProductDto | null> {
    // Obtener el producto antes de actualizarlo
    const productBefore = await this.productRepository.getProductById(id);
    
    if (!productBefore) {
      return null;
    }

    const productAfter = await this.productRepository.updateProduct(id, command);
    
    if (productAfter) {
      // Registrar auditoría
      await this.auditoriService.createAudit({
        user: userId,
        action: "UPDATE",
        entity: "Product",
        entityId: productAfter.id,
        description: `Producto actualizado: ${productAfter.name}`,
        changes: {
          before: {
            name: productBefore.name,
            description: productBefore.description,
            price: productBefore.price,
            stock: productBefore.stock,
            category: productBefore.category,
            active: productBefore.active
          },
          after: {
            name: productAfter.name,
            description: productAfter.description,
            price: productAfter.price,
            stock: productAfter.stock,
            category: productAfter.category,
            active: productAfter.active
          }
        },
        ip
      });
    }

    return productAfter;
  }

  async deleteProduct(id: string, userId: string, ip?: string): Promise<void> {
    // Obtener el producto antes de eliminarlo
    const product = await this.productRepository.getProductById(id);
    
    if (product) {
      await this.productRepository.deleteProduct(id);
      
      // Registrar auditoría
      await this.auditoriService.createAudit({
        user: userId,
        action: "DELETE",
        entity: "Product",
        entityId: product.id,
        description: `Producto eliminado: ${product.name}`,
        changes: {
          before: {
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: product.category,
            active: product.active
          }
        },
        ip
      });
    }
  }

  async increaseStock(id: string, quantity: number, userId: string, ip?: string): Promise<ProductDto | null> {
    // Obtener el stock anterior
    const productBefore = await this.productRepository.getProductById(id);
    
    if (!productBefore) {
      return null;
    }

    const productAfter = await this.productRepository.increaseStock(id, quantity);
    
    if (productAfter) {
      // Registrar auditoría
      await this.auditoriService.createAudit({
        user: userId,
        action: "UPDATE",
        entity: "Product",
        entityId: productAfter.id,
        description: `Stock aumentado: ${productAfter.name} (+${quantity} unidades)`,
        changes: {
          before: { stock: productBefore.stock },
          after: { stock: productAfter.stock }
        },
        ip
      });
    }

    return productAfter;
  }

  async decreaseStock(id: string, quantity: number, userId: string, ip?: string): Promise<ProductDto | null> {
    // Obtener el stock anterior
    const productBefore = await this.productRepository.getProductById(id);
    
    if (!productBefore) {
      return null;
    }

    const productAfter = await this.productRepository.decreaseStock(id, quantity);
    
    if (productAfter) {
      // Registrar auditoría
      await this.auditoriService.createAudit({
        user: userId,
        action: "UPDATE",
        entity: "Product",
        entityId: productAfter.id,
        description: `Stock disminuido: ${productAfter.name} (-${quantity} unidades)`,
        changes: {
          before: { stock: productBefore.stock },
          after: { stock: productAfter.stock }
        },
        ip
      });
    }

    return productAfter;
  }

  async deactivateProduct(id: string, userId: string, ip?: string): Promise<ProductDto | null> {
    const productBefore = await this.productRepository.getProductById(id);
    
    if (!productBefore) {
      return null;
    }

    const productAfter = await this.productRepository.deactivateProduct(id);
    
    if (productAfter) {
      // Registrar auditoría
      await this.auditoriService.createAudit({
        user: userId,
        action: "UPDATE",
        entity: "Product",
        entityId: productAfter.id,
        description: `Producto desactivado: ${productAfter.name}`,
        changes: {
          before: { active: productBefore.active },
          after: { active: productAfter.active }
        },
        ip
      });
    }

    return productAfter;
  }

  //funcion para buscar producto por nombre o codigo
  async getOneProductByNameOrCode(nameOrCode: string): Promise<ProductDto | null> {
    const product = await this.productRepository.getOneProductByNameOrCode(nameOrCode);
    return product;
  }

  //funcion para buscar productos por coincidencias
  async searchProductsByQuery(query: string): Promise<ProductDto[]> {
    if (!query.trim()) {
      return [];
    }
    const products = await this.productRepository.searchProductsByQuery(query);
    return products;
  }
}
