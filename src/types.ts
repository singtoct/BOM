

export interface Material {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  imageUrl?: string;
  stockQuantity: number;
}

export interface Product {
  id:string;
  name: string;
  imageUrl: string;
  totalMaterialCost: number;
  sellingPrice: number;
}

export interface BomComponent {
  id: string; // e.g., `${productId}-${materialId}`
  productId: string;
  materialId: string;
  quantity: number;
}

export interface BomComponentWithDetails extends BomComponent {
    materialName: string;
    materialUnit: string;
    materialPricePerUnit: number;
    componentCost: number;
}

export interface ProductionOrderItem {
    productId: string;
    quantity: number;
}

export interface ProductionOrder {
    id: string;
    createdAt: string; // ISO string date
    items: ProductionOrderItem[];
    totalPurchaseCost: number;
}

export interface GoodsReceipt {
  id: string;
  receiptDate: string; // ISO string date
  materialId: string;
  quantity: number;
  notes: string;
}


export type View = 
  | { type: 'products' }
  | { type: 'materials' }
  | { type: 'product-detail'; productId: string }
  | { type: 'calculator' }
  | { type: 'dashboard' }
  | { type: 'receipt-report' };

export type Action =
  | { type: 'ADD_MATERIAL'; payload: Material }
  | { type: 'UPDATE_MATERIAL'; payload: Material }
  | { type: 'DELETE_MATERIAL'; payload: string } // id
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Partial<Product> & { id: string } }
  | { type: 'DELETE_PRODUCT'; payload: string } // id
  | { type: 'ADD_BOM_COMPONENT'; payload: BomComponent }
  | { type: 'UPDATE_BOM_COMPONENT'; payload: BomComponent }
  | { type: 'DELETE_BOM_COMPONENT'; payload: string } // id
  | { type: 'COPY_BOM_COMPONENTS'; payload: { sourceProductId: string; targetProductId: string } }
  | { type: 'ADD_PRODUCTION_ORDER', payload: ProductionOrder };


export interface State {
    materials: Material[];
    products: Product[];
    bomComponents: BomComponent[];
    productionOrders: ProductionOrder[];
    goodsReceipts: GoodsReceipt[];
}