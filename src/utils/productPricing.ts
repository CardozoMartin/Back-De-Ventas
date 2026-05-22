import { UnitType } from '../models/Product.model';
import { roundWeightKg } from './formatQuantity';

export interface ProductPricingInput {
  price: number;
  costPrice?: number;
  stock?: number;
  unitType?: UnitType;
}

export function analyzeProductPricing(product: ProductPricingInput) {
  const isWeight = product.unitType === 'kilogramo';
  const saleUnitPrice = product.price;
  const rawCost = product.costPrice ?? 0;
  const stock = roundWeightKg(product.stock ?? 0);

  let costUnitPrice = rawCost;
  let costNormalizedFromStock = false;

  if (isWeight && stock > 0 && rawCost > saleUnitPrice) {
    const costPerKgFromStock = rawCost / stock;
    if (
      rawCost > saleUnitPrice * 1.5 &&
      costPerKgFromStock <= saleUnitPrice * 1.25 &&
      stock >= 0.5
    ) {
      costUnitPrice = costPerKgFromStock;
      costNormalizedFromStock = true;
    }
  }

  const profitPerUnit = saleUnitPrice - costUnitPrice;
  const marginPct = saleUnitPrice > 0 ? (profitPerUnit / saleUnitPrice) * 100 : 0;

  return {
    costUnitPrice,
    profitPerUnit: parseFloat(profitPerUnit.toFixed(2)),
    marginPct: parseFloat(marginPct.toFixed(2)),
    sellsAtLoss: costUnitPrice > saleUnitPrice,
    costNormalizedFromStock,
  };
}

export function normalizeWeightProductCost(
  unitType: UnitType | undefined,
  price: number,
  costPrice: number | undefined,
  stock: number
): number | undefined {
  if (costPrice === undefined || costPrice === null) return costPrice;
  const stockKg = roundWeightKg(stock);
  if (unitType !== 'kilogramo' || stockKg <= 0) return costPrice;

  if (costPrice > price * 1.5 && stockKg >= 0.5) {
    const perKg = costPrice / stockKg;
    if (perKg <= price * 1.25) {
      return parseFloat(perKg.toFixed(2));
    }
  }
  return costPrice;
}
