import cron from 'node-cron';
import { Product } from '../models/Product.model';

export class ProductMaintenanceJob {
  
  // Ejecutar todos los días a las 3:00 AM
  static init() {
    cron.schedule('0 3 * * *', async () => {
      console.log('[CRON] Iniciando mantenimiento de catálogo de productos...');
      try {
        await this.runMaintenance();
        console.log('[CRON] Mantenimiento finalizado con éxito.');
      } catch (error) {
        console.error('[CRON] Error durante el mantenimiento:', error);
      }
    });
  }

  static async runMaintenance() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // 1. Productos sin precio de costo, sin categoría o precio inválido -> incompleto
    await Product.updateMany(
      {
        $or: [
          { costPrice: { $lte: 0 } },
          { category: null },
          { category: "" },
          { $expr: { $lt: ["$price", "$costPrice"] } } // Margen negativo
        ],
        status: { $nin: ['oculto', 'archivado', 'incompleto'] }
      },
      { $set: { status: 'incompleto' } }
    );

    // 2. Productos sin movimiento (ej. stock > 0 pero sin actualización de stock en 60 días)
    await Product.updateMany(
      {
        stock: { $gt: 0 },
        lastStockUpdate: { $lt: sixtyDaysAgo },
        status: { $nin: ['oculto', 'archivado', 'sin_movimiento', 'incompleto'] }
      },
      { $set: { status: 'sin_movimiento' } }
    );

    // 3. Productos activos que no se han actualizado en absoluto (precio, stock) en 30 días -> pendiente de revisión
    await Product.updateMany(
      {
        lastPriceUpdate: { $lt: thirtyDaysAgo },
        status: 'activo'
      },
      { $set: { status: 'pendiente_revision' } }
    );
    
    // Aquí también podríamos limpiar lógicamente si un producto está en 'sin_movimiento' por demasiado tiempo, pero lo dejamos manual para que el usuario decida.
  }
}
