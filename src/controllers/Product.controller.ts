import { injectable } from "tsyringe";
import { ProductService } from "../service/Product.services";
import { ISuccessResponse, IErrorResponse } from "../types/IResponse.types";
import { Request, Response } from "express";

@injectable()
export class ProductController {
  constructor(private productService: ProductService) { }

  //controlador para crear un producto
  async createProduct(req: Request, res: Response): Promise<Response> {
    try {
      const product = await this.productService.createProduct(req.body);
      const response: ISuccessResponse<typeof product> = {
        success: true,
        data: product,
        message: "Producto creado exitosamente",
        timestamp: new Date(),
      };
      return res.status(201).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al crear el producto",
        errorCode: "PRODUCT_CREATION_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para obtener un producto por id
  async getProductById(req: Request, res: Response): Promise<Response> {
    try {
      const product = await this.productService.getProductById(req.params.id);
      if (!product) {
        const response: IErrorResponse = {
          success: false,
          error: "Producto no encontrado",
          errorCode: "PRODUCT_NOT_FOUND",
          message: "No se encontró un producto con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof product> = {
        success: true,
        data: product,
        message: "Producto obtenido exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener el producto",
        errorCode: "PRODUCT_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para obtener todos los productos
  async getAllProducts(req: Request, res: Response): Promise<Response> {
    try {
      const products = await this.productService.getAllProducts();
      const response: ISuccessResponse<typeof products> = {
        success: true,
        data: products,
        message: "Productos obtenidos exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener los productos",
        errorCode: "PRODUCTS_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para actualizar un producto
  async updateProduct(req: Request, res: Response): Promise<Response> {
    try {
      const product = await this.productService.updateProduct(req.params.id, req.body);
      if (!product) {
        const response: IErrorResponse = {
          success: false,
          error: "Producto no encontrado",
          errorCode: "PRODUCT_NOT_FOUND",
          message: "No se encontró un producto con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof product> = {
        success: true,
        data: product,
        message: "Producto actualizado exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al actualizar el producto",
        errorCode: "PRODUCT_UPDATE_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para eliminar un producto
  async deleteProduct(req: Request, res: Response): Promise<Response> {
    try {
      await this.productService.deleteProduct(req.params.id);
      const response: ISuccessResponse<null> = {
        success: true,
        data: null,
        message: "Producto eliminado exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al eliminar el producto",
        errorCode: "PRODUCT_DELETION_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para aumentar el stock
  async increaseStock(req: Request, res: Response): Promise<Response> {
    try {
      const { quantity } = req.body;
      if (!quantity || quantity <= 0) {
        const response: IErrorResponse = {
          success: false,
          error: "Cantidad inválida",
          errorCode: "INVALID_QUANTITY",
          message: "La cantidad debe ser mayor a 0",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }
      const product = await this.productService.increaseStock(req.params.id, quantity);
      if (!product) {
        const response: IErrorResponse = {
          success: false,
          error: "Producto no encontrado",
          errorCode: "PRODUCT_NOT_FOUND",
          message: "No se encontró un producto con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof product> = {
        success: true,
        data: product,
        message: `Stock aumentado exitosamente (+${quantity})`,
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al aumentar el stock",
        errorCode: "STOCK_INCREASE_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para disminuir el stock
  async decreaseStock(req: Request, res: Response): Promise<Response> {
    try {
      const { quantity } = req.body;
      if (!quantity || quantity <= 0) {
        const response: IErrorResponse = {
          success: false,
          error: "Cantidad inválida",
          errorCode: "INVALID_QUANTITY",
          message: "La cantidad debe ser mayor a 0",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }
      const product = await this.productService.decreaseStock(req.params.id, quantity);
      if (!product) {
        const response: IErrorResponse = {
          success: false,
          error: "Producto no encontrado",
          errorCode: "PRODUCT_NOT_FOUND",
          message: "No se encontró un producto con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof product> = {
        success: true,
        data: product,
        message: `Stock disminuido exitosamente (-${quantity})`,
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al disminuir el stock",
        errorCode: "STOCK_DECREASE_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para desactivar un producto
  async deactivateProduct(req: Request, res: Response): Promise<Response> {
    try {
      const product = await this.productService.deactivateProduct(req.params.id);
      if (!product) {
        const response: IErrorResponse = {
          success: false,
          error: "Producto no encontrado",
          errorCode: "PRODUCT_NOT_FOUND",
          message: "No se encontró un producto con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof product> = {
        success: true,
        data: product,
        message: "Producto desactivado exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al desactivar el producto",
        errorCode: "PRODUCT_DEACTIVATION_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }
}
