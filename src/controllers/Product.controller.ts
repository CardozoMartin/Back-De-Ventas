import { injectable } from "tsyringe";
import { ProductService } from "../service/Product.service";
import { ISuccessResponse } from "../types/IResponse.types";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../middlewares/errorHandler";
import { catchAsync } from "../utils/catchAsync";

@injectable()
export class ProductController {
  constructor(private productService: ProductService) { }

  //controlador para crear un producto
  createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    const product = await this.productService.createProduct(req.body, user._id || user.id, ip);
    const response: ISuccessResponse<typeof product> = {
      success: true,
      data: product,
      message: "Producto creado exitosamente",
      timestamp: new Date(),
    };
    res.status(201).json(response);
  });

  //controlador para obtener un producto por id
  getProductById = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const product = await this.productService.getProductById(req.params.id);
    if (!product) {
      throw new AppError("No se encontró un producto con el ID proporcionado", 404, "PRODUCT_NOT_FOUND");
    }
    const response: ISuccessResponse<typeof product> = {
      success: true,
      data: product,
      message: "Producto obtenido exitosamente",
      timestamp: new Date(),
    };
    res.status(200).json(response);
  });

  //controlador para obtener todos los productos
  getAllProducts = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await this.productService.getAllProducts(page, limit);
    const response: ISuccessResponse<typeof result> = {
      success: true,
      data: result,
      message: "Productos obtenidos exitosamente",
      timestamp: new Date(),
    };
    res.status(200).json(response);
  });

  //controlador para actualizar un producto
  updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    const product = await this.productService.updateProduct(req.params.id, req.body, user._id || user.id, ip);
    if (!product) {
      throw new AppError("No se encontró un producto con el ID proporcionado", 404, "PRODUCT_NOT_FOUND");
    }
    const response: ISuccessResponse<typeof product> = {
      success: true,
      data: product,
      message: "Producto actualizado exitosamente",
      timestamp: new Date(),
    };
    res.status(200).json(response);
  });

  //controlador para eliminar un producto
  deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    await this.productService.deleteProduct(req.params.id, user._id || user.id, ip);
    const response: ISuccessResponse<null> = {
      success: true,
      data: null,
      message: "Producto eliminado exitosamente",
      timestamp: new Date(),
    };
    res.status(200).json(response);
  });

  //controlador para aumentar el stock
  increaseStock = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
      throw new AppError("La cantidad debe ser mayor a 0", 400, "INVALID_QUANTITY");
    }
    const product = await this.productService.increaseStock(req.params.id, quantity, user._id || user.id, ip);
    if (!product) {
      throw new AppError("No se encontró un producto con el ID proporcionado", 404, "PRODUCT_NOT_FOUND");
    }
    const response: ISuccessResponse<typeof product> = {
      success: true,
      data: product,
      message: `Stock aumentado exitosamente (+${quantity})`,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  });

  //controlador para disminuir el stock
  decreaseStock = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
      throw new AppError("La cantidad debe ser mayor a 0", 400, "INVALID_QUANTITY");
    }
    const product = await this.productService.decreaseStock(req.params.id, quantity, user._id || user.id, ip);
    if (!product) {
      throw new AppError("No se encontró un producto con el ID proporcionado", 404, "PRODUCT_NOT_FOUND");
    }
    const response: ISuccessResponse<typeof product> = {
      success: true,
      data: product,
      message: `Stock disminuido exitosamente (-${quantity})`,
      timestamp: new Date(),
    };
    res.status(200).json(response);
  });

  //controlador para desactivar un producto
  deactivateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    const product = await this.productService.deactivateProduct(req.params.id, user._id || user.id, ip);
    if (!product) {
      throw new AppError("No se encontró un producto con el ID proporcionado", 404, "PRODUCT_NOT_FOUND");
    }
    const response: ISuccessResponse<typeof product> = {
      success: true,
      data: product,
      message: "Producto desactivado exitosamente",
      timestamp: new Date(),
    };
    res.status(200).json(response);
  });

  //controlador para obtener todos los productos sin paginacion
  getAllProductsNoPagination = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const products = await this.productService.getAllProductsSinPage();
    const response: ISuccessResponse<typeof products> = {
      success: true,
      data: products,
      message: "Productos obtenidos exitosamente",
      timestamp: new Date(),
    };
    res.status(200).json(response);
  });

  //controlador para obtener producto por nombre o ocodigo
  getOneProductByNameOrCode = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { nameOrCode } = req.params;
    const product = await this.productService.getOneProductByNameOrCode(nameOrCode);
    if (!product) {
      throw new AppError("No se encontró un producto con el nombre o código proporcionado", 404, "PRODUCT_NOT_FOUND");
    }
    const response: ISuccessResponse<typeof product> = {
      success: true,
      data: product,
      message: "Producto obtenido exitosamente",
      timestamp: new Date(),
    };
    res.status(200).json(response);
  });

  //controlador para buscar productos por coincidencias
  searchProducts = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      throw new AppError("Por favor proporciona un término de búsqueda", 400, "MISSING_QUERY");
    }

    const products = await this.productService.searchProductsByQuery(query);
    const response: ISuccessResponse<typeof products> = {
      success: true,
      data: products,
      message: "Productos encontrados exitosamente",
      timestamp: new Date(),
    };
    res.status(200).json(response);
  });
}

