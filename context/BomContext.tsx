
import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { State, Action, Material, Product, BomComponent } from '../types';

const LOCAL_STORAGE_KEY = 'bom-app-data';

const newMaterialsFromImage: Omit<Material, 'imageUrl' | 'stockQuantity'>[] = [
  { id: 'IMG-MAT-001', name: 'พลาสติกแพค BOX Gpower 4x4', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-002', name: 'พลาสติกแพค BOX Gpower 2x4', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-003', name: 'พลาสติกแพค BOX Gpower 4x4 ดำ', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-004', name: 'พลาสติกแพค BOX Gpower 2x4 ดำ', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-005', name: 'พลาสติกแพค ฝา Gpower 101', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-006', name: 'พลาสติกแพค ฝา Gpower 102', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-007', name: 'พลาสติกแพค ฝา Gpower 103', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-008', name: 'พลาสติกแพค ฝา Gpower 104', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-009', name: 'พลาสติกแพค ฝา Gpower 106', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-010', name: 'พลาสติกแพค ฝา Gpower 1022', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-011', name: 'พลาสติกแพค BOX CT 4x4', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-012', name: 'พลาสติกแพค BOX CT 2x4', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-013', name: 'พลาสติกแพค BOX CT 4x4 ดำ', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-014', name: 'พลาสติกแพค BOX CT 2x4 ดำ', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-015', name: 'พลาสติกแพค ฝา CT 101', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-016', name: 'พลาสติกแพค ฝา CT 102', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-017', name: 'พลาสติกแพค ฝา CT 103', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-018', name: 'พลาสติกแพค ฝา CT 104', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-019', name: 'พลาสติกแพค ฝา CT 106', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-020', name: 'พลาสติกแพค ฝา CT 1022', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-021', name: 'พลาสติกแพค ฝา CT 101B', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-022', name: 'พลาสติกแพค ฝา CT 102B', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-023', name: 'พลาสติกแพค ฝา CT 103B', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-024', name: 'พลาสติกแพค ฝา CT 104B', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-025', name: 'พลาสติกแพค ฝา CT 106B', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-026', name: 'พลาสติกแพค ฝา CT 1022B', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-027', name: 'พลาสติกกันรอย NEW 2 153 mm.', unit: 'ม้วน', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-028', name: 'พลาสติกกันรอย NEW 4 203 mm.', unit: 'ม้วน', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-029', name: 'พลาสติกกันรอย NEW 6 238 mm.', unit: 'ม้วน', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-030', name: 'พลาสติกกันรอย NEW 8 273 mm.', unit: 'ม้วน', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-031', name: 'พลาสติกกันรอย NEW 10 310 mm.', unit: 'ม้วน', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-032', name: 'พลาสติกกันรอย 115 mm.', unit: 'ม้วน', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-033', name: 'พลาสติกกันรอย 130 mm.', unit: 'ม้วน', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-034', name: 'พลาสติกแพค BEWON 2x4', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-035', name: 'พลาสติกแพค BEWON 4x4', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-036', name: 'พลาสติกแพค BEWON 201', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-037', name: 'พลาสติกแพค BEWON 202', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-038', name: 'พลาสติกแพค BEWON 203', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-039', name: 'พลาสติกแพค BEWON 222', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-040', name: 'พลาสติกแพค BEWON 604', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-041', name: 'พลาสติกแพค BEWON 606', unit: 'กิโลกรัม', pricePerUnit: 104.4 },
  { id: 'IMG-MAT-042', name: 'กล่อง G-Power 101', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-043', name: 'กล่อง G-Power 102', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-044', name: 'กล่อง G-Power 103', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-045', name: 'กล่อง G-Power 103B', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-046', name: 'กล่อง G-Power 104', unit: 'ใบ', pricePerUnit: 3.06 },
  { id: 'IMG-MAT-047', name: 'กล่อง G-Power 106', unit: 'ใบ', pricePerUnit: 3.06 },
  { id: 'IMG-MAT-048', name: 'กล่อง G-Power 1022', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-049', name: 'กล่อง CT 101', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-050', name: 'กล่อง CT 102', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-051', name: 'กล่อง CT 103', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-052', name: 'กล่อง CT 104', unit: 'ใบ', pricePerUnit: 3.06 },
  { id: 'IMG-MAT-053', name: 'กล่อง CT 106', unit: 'ใบ', pricePerUnit: 3.06 },
  { id: 'IMG-MAT-054', name: 'กล่อง CT 1022', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-055', name: 'กล่อง CT 101B', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-056', name: 'กล่อง CT 102B', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-057', name: 'กล่อง CT 103B', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-058', name: 'กล่อง CT 104B', unit: 'ใบ', pricePerUnit: 3.06 },
  { id: 'IMG-MAT-059', name: 'กล่อง CT 106B', unit: 'ใบ', pricePerUnit: 3.06 },
  { id: 'IMG-MAT-060', name: 'กล่อง CT 1022B', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-061', name: 'กล่อง BEWON 201', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-062', name: 'กล่อง BEWON 202', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-063', name: 'กล่อง BEWON 222', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-064', name: 'กล่อง BEWON 203', unit: 'ใบ', pricePerUnit: 2.57 },
  { id: 'IMG-MAT-065', name: 'กล่อง BEWON 604', unit: 'ใบ', pricePerUnit: 3.06 },
  { id: 'IMG-MAT-066', name: 'กล่อง BEWON 606', unit: 'ใบ', pricePerUnit: 3.06 },
  { id: 'IMG-MAT-067', name: 'ลัง CT 101-1022', unit: 'ใบ', pricePerUnit: 12 },
  { id: 'IMG-MAT-068', name: 'ลัง CT 104-106', unit: 'ใบ', pricePerUnit: 16 },
  { id: 'IMG-MAT-069', name: 'ลัง Gpower 101-1022', unit: 'ใบ', pricePerUnit: 12 },
  { id: 'IMG-MAT-070', name: 'ลัง Gpower 104-106', unit: 'ใบ', pricePerUnit: 16 },
  { id: 'IMG-MAT-071', name: 'ลัง CT 2x4', unit: 'ใบ', pricePerUnit: 13 },
  { id: 'IMG-MAT-072', name: 'ลัง CT 4x4', unit: 'ใบ', pricePerUnit: 16 },
  { id: 'IMG-MAT-073', name: 'ลัง Gpower 2x4', unit: 'ใบ', pricePerUnit: 13 },
  { id: 'IMG-MAT-074', name: 'ลัง Gpower 4x4', unit: 'ใบ', pricePerUnit: 16 },
  { id: 'IMG-MAT-075', name: 'ลัง BEWON 201', unit: 'ใบ', pricePerUnit: 12 },
  { id: 'IMG-MAT-076', name: 'ลัง BEWON 202', unit: 'ใบ', pricePerUnit: 12 },
  { id: 'IMG-MAT-077', name: 'ลัง BEWON 222', unit: 'ใบ', pricePerUnit: 12 },
  { id: 'IMG-MAT-078', name: 'ลัง BEWON 203', unit: 'ใบ', pricePerUnit: 12 },
  { id: 'IMG-MAT-079', name: 'ลัง BEWON 604', unit: 'ใบ', pricePerUnit: 16 },
  { id: 'IMG-MAT-080', name: 'ลัง BEWON 606', unit: 'ใบ', pricePerUnit: 16 },
  { id: 'IMG-MAT-081', name: 'ลัง BEWON 2x4', unit: 'ใบ', pricePerUnit: 13 },
  { id: 'IMG-MAT-082', name: 'ลัง BEWON 4x4', unit: 'ใบ', pricePerUnit: 16 },
  { id: 'IMG-MAT-083', name: 'เม็ด ABS ขาว', unit: 'กิโลกรัม', pricePerUnit: 46 },
  { id: 'IMG-MAT-084', name: 'เม็ด ABS ฝาใหญ่ 9421', unit: 'กิโลกรัม', pricePerUnit: 46 },
  { id: 'IMG-MAT-085', name: 'เม็ด ABS ดำ', unit: 'กิโลกรัม', pricePerUnit: 35 },
  { id: 'IMG-MAT-086', name: 'เม็ด PC ใส', unit: 'กิโลกรัม', pricePerUnit: 55 },
  { id: 'IMG-MAT-087', name: 'เม็ด PC ใสเทา', unit: 'กิโลกรัม', pricePerUnit: 55 },
  { id: 'IMG-MAT-088', name: 'เม็ด PC ขาวใหญ่ 9410', unit: 'กิโลกรัม', pricePerUnit: 55 },
  { id: 'IMG-MAT-089', name: 'เม็ด PC ขาวอะไหล่ 9209', unit: 'กิโลกรัม', pricePerUnit: 55 },
  { id: 'IMG-MAT-090', name: 'เม็ด PC ดำ', unit: 'กิโลกรัม', pricePerUnit: 55 },
  { id: 'IMG-MAT-091', name: 'เม็ด PC เขียว', unit: 'กิโลกรัม', pricePerUnit: 55 },
  { id: 'IMG-MAT-092', name: 'เม็ด PC ครีม', unit: 'กิโลกรัม', pricePerUnit: 55 },
  { id: 'IMG-MAT-093', name: 'เม็ด HIPS', unit: 'กิโลกรัม', pricePerUnit: 44 },
  { id: 'IMG-MAT-094', name: 'เม็ด HIPS ดำ', unit: 'กิโลกรัม', pricePerUnit: 30 },
  { id: 'IMG-MAT-095', name: 'เม็ด POM', unit: 'กิโลกรัม', pricePerUnit: 65 },
  { id: 'IMG-MAT-096', name: 'เม็ด POM เหลือง', unit: 'กิโลกรัม', pricePerUnit: 65 },
  { id: 'IMG-MAT-097', name: 'เม็ดพุก', unit: 'กิโลกรัม', pricePerUnit: 40 },
  { id: 'IMG-MAT-098', name: 'สกรู P# 7x1"', unit: 'ชิ้น', pricePerUnit: 0.06 },
  { id: 'IMG-MAT-099', name: 'สกรู P# 7x1/2"', unit: 'ชิ้น', pricePerUnit: 0.08 },
];

const newProductsFromImage: Product[] = [
    { id: 'IMG-PROD-101', name: 'บล็อคลอย G-Power 2x4', imageUrl: 'https://picsum.photos/seed/IMG-PROD-101/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-102', name: 'บล็อคลอย G-Power 4x4', imageUrl: 'https://picsum.photos/seed/IMG-PROD-102/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-103', name: 'บล็อคลอย G-Power 2x4B', imageUrl: 'https://picsum.photos/seed/IMG-PROD-103/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-104', name: 'บล็อคลอย G-Power 4x4B', imageUrl: 'https://picsum.photos/seed/IMG-PROD-104/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-105', name: 'บล็อคลอย CT 2x4', imageUrl: 'https://picsum.photos/seed/IMG-PROD-105/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-106', name: 'บล็อคลอย CT 4x4', imageUrl: 'https://picsum.photos/seed/IMG-PROD-106/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-107', name: 'บล็อคลอย CT 2x4B', imageUrl: 'https://picsum.photos/seed/IMG-PROD-107/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-108', name: 'บล็อคลอย CT 4x4B', imageUrl: 'https://picsum.photos/seed/IMG-PROD-108/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-109', name: 'ฝาหน้ากาก CT A-101', imageUrl: 'https://picsum.photos/seed/IMG-PROD-109/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-110', name: 'ฝาหน้ากาก CT A-102', imageUrl: 'https://picsum.photos/seed/IMG-PROD-110/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-111', name: 'ฝาหน้ากาก CT A-103', imageUrl: 'https://picsum.photos/seed/IMG-PROD-111/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-112', name: 'ฝาหน้ากาก CT A-1022', imageUrl: 'https://picsum.photos/seed/IMG-PROD-112/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-113', name: 'ฝาหน้ากาก CT A-104', imageUrl: 'https://picsum.photos/seed/IMG-PROD-113/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-114', name: 'ฝาหน้ากาก CT A-106', imageUrl: 'https://picsum.photos/seed/IMG-PROD-114/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-115', name: 'บล็อคลอย BEWON 2x4', imageUrl: 'https://picsum.photos/seed/IMG-PROD-115/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-116', name: 'บล็อคลอย BEWON 4x4', imageUrl: 'https://picsum.photos/seed/IMG-PROD-116/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-117', name: 'ฝาหน้ากาก BEWON 201', imageUrl: 'https://picsum.photos/seed/IMG-PROD-117/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-118', name: 'ฝาหน้ากาก BEWON 202', imageUrl: 'https://picsum.photos/seed/IMG-PROD-118/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-119', name: 'ฝาหน้ากาก BEWON 203', imageUrl: 'https://picsum.photos/seed/IMG-PROD-119/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-120', name: 'ฝาหน้ากาก BEWON 222', imageUrl: 'https://picsum.photos/seed/IMG-PROD-120/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-121', name: 'ฝาหน้ากาก BEWON 604', imageUrl: 'https://picsum.photos/seed/IMG-PROD-121/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-122', name: 'ฝาหน้ากาก BEWON 606', imageUrl: 'https://picsum.photos/seed/IMG-PROD-122/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-123', name: 'ฝาเทาใส CHONG-2 PC', imageUrl: 'https://picsum.photos/seed/IMG-PROD-123/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-124', name: 'ฝาเทาใส CHONG-4 PC', imageUrl: 'https://picsum.photos/seed/IMG-PROD-124/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-125', name: 'ฝาเทาใส CHONG-6 PC', imageUrl: 'https://picsum.photos/seed/IMG-PROD-125/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-126', name: 'ฝาเทาใส CHONG-8 PC', imageUrl: 'https://picsum.photos/seed/IMG-PROD-126/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-127', name: 'ฝาเทาใส CHONG-10 PC', imageUrl: 'https://picsum.photos/seed/IMG-PROD-127/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-128', name: 'ฝาขาว CHONG-2 ABS', imageUrl: 'https://picsum.photos/seed/IMG-PROD-128/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-129', name: 'ฝาขาว CHONG-4 ABS', imageUrl: 'https://picsum.photos/seed/IMG-PROD-129/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-130', name: 'ฝาขาว CHONG-6 ABS', imageUrl: 'https://picsum.photos/seed/IMG-PROD-130/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-131', name: 'ฝาขาว CHONG-8 ABS', imageUrl: 'https://picsum.photos/seed/IMG-PROD-131/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'IMG-PROD-132', name: 'ฝาขาว CHONG-10 ABS', imageUrl: 'https://picsum.photos/seed/IMG-PROD-132/400/300', totalMaterialCost: 0, sellingPrice: 0 },
];
const newBomComponentsFromImage: BomComponent[] = [
    { id: 'IMG-PROD-101-PP-001', productId: 'IMG-PROD-101', materialId: 'PP-001', quantity: 0.0458 },
    { id: 'IMG-PROD-101-OTHER-COSTS', productId: 'IMG-PROD-101', materialId: 'OTHER-COSTS', quantity: 1.15 },
    { id: 'IMG-PROD-102-PP-001', productId: 'IMG-PROD-102', materialId: 'PP-001', quantity: 0.0626 },
    { id: 'IMG-PROD-102-OTHER-COSTS', productId: 'IMG-PROD-102', materialId: 'OTHER-COSTS', quantity: 1.61 },
    { id: 'IMG-PROD-103-PP-001', productId: 'IMG-PROD-103', materialId: 'PP-001', quantity: 0.0458 },
    { id: 'IMG-PROD-103-OTHER-COSTS', productId: 'IMG-PROD-103', materialId: 'OTHER-COSTS', quantity: 1.16 },
    { id: 'IMG-PROD-104-PP-001', productId: 'IMG-PROD-104', materialId: 'PP-001', quantity: 0.0626 },
    { id: 'IMG-PROD-104-OTHER-COSTS', productId: 'IMG-PROD-104', materialId: 'OTHER-COSTS', quantity: 1.73 },
    { id: 'IMG-PROD-105-PP-001', productId: 'IMG-PROD-105', materialId: 'PP-001', quantity: 0.0458 },
    { id: 'IMG-PROD-105-OTHER-COSTS', productId: 'IMG-PROD-105', materialId: 'OTHER-COSTS', quantity: 1.29 },
    { id: 'IMG-PROD-106-PP-001', productId: 'IMG-PROD-106', materialId: 'PP-001', quantity: 0.0626 },
    { id: 'IMG-PROD-106-OTHER-COSTS', productId: 'IMG-PROD-106', materialId: 'OTHER-COSTS', quantity: 1.61 },
    { id: 'IMG-PROD-107-PP-001', productId: 'IMG-PROD-107', materialId: 'PP-001', quantity: 0.0458 },
    { id: 'IMG-PROD-107-OTHER-COSTS', productId: 'IMG-PROD-107', materialId: 'OTHER-COSTS', quantity: 1.16 },
    { id: 'IMG-PROD-108-PP-001', productId: 'IMG-PROD-108', materialId: 'PP-001', quantity: 0.0626 },
    { id: 'IMG-PROD-108-OTHER-COSTS', productId: 'IMG-PROD-108', materialId: 'OTHER-COSTS', quantity: 1.73 },
    { id: 'IMG-PROD-109-PP-001', productId: 'IMG-PROD-109', materialId: 'PP-001', quantity: 0.0185 },
    { id: 'IMG-PROD-109-OTHER-COSTS', productId: 'IMG-PROD-109', materialId: 'OTHER-COSTS', quantity: 2.74 },
    { id: 'IMG-PROD-110-PP-001', productId: 'IMG-PROD-110', materialId: 'PP-001', quantity: 0.0170 },
    { id: 'IMG-PROD-110-OTHER-COSTS', productId: 'IMG-PROD-110', materialId: 'OTHER-COSTS', quantity: 2.76 },
    { id: 'IMG-PROD-111-PP-001', productId: 'IMG-PROD-111', materialId: 'PP-001', quantity: 0.0155 },
    { id: 'IMG-PROD-111-OTHER-COSTS', productId: 'IMG-PROD-111', materialId: 'OTHER-COSTS', quantity: 2.71 },
    { id: 'IMG-PROD-112-PP-001', productId: 'IMG-PROD-112', materialId: 'PP-001', quantity: 0.0170 },
    { id: 'IMG-PROD-112-OTHER-COSTS', productId: 'IMG-PROD-112', materialId: 'OTHER-COSTS', quantity: 2.98 },
    { id: 'IMG-PROD-113-PP-001', productId: 'IMG-PROD-113', materialId: 'PP-001', quantity: 0.0260 },
    { id: 'IMG-PROD-113-OTHER-COSTS', productId: 'IMG-PROD-113', materialId: 'OTHER-COSTS', quantity: 3.48 },
    { id: 'IMG-PROD-114-PP-001', productId: 'IMG-PROD-114', materialId: 'PP-001', quantity: 0.0218 },
    { id: 'IMG-PROD-114-OTHER-COSTS', productId: 'IMG-PROD-114', materialId: 'OTHER-COSTS', quantity: 3.81 },
    { id: 'IMG-PROD-115-PP-001', productId: 'IMG-PROD-115', materialId: 'PP-001', quantity: 0.0458 },
    { id: 'IMG-PROD-115-OTHER-COSTS', productId: 'IMG-PROD-115', materialId: 'OTHER-COSTS', quantity: 1.29 },
    { id: 'IMG-PROD-116-PP-001', productId: 'IMG-PROD-116', materialId: 'PP-001', quantity: 0.0626 },
    { id: 'IMG-PROD-116-OTHER-COSTS', productId: 'IMG-PROD-116', materialId: 'OTHER-COSTS', quantity: 1.85 },
    { id: 'IMG-PROD-117-PP-001', productId: 'IMG-PROD-117', materialId: 'PP-001', quantity: 0.0185 },
    { id: 'IMG-PROD-117-OTHER-COSTS', productId: 'IMG-PROD-117', materialId: 'OTHER-COSTS', quantity: 2.65 },
    { id: 'IMG-PROD-118-PP-001', productId: 'IMG-PROD-118', materialId: 'PP-001', quantity: 0.0170 },
    { id: 'IMG-PROD-118-OTHER-COSTS', productId: 'IMG-PROD-118', materialId: 'OTHER-COSTS', quantity: 2.66 },
    { id: 'IMG-PROD-119-PP-001', productId: 'IMG-PROD-119', materialId: 'PP-001', quantity: 0.0155 },
    { id: 'IMG-PROD-119-OTHER-COSTS', productId: 'IMG-PROD-119', materialId: 'OTHER-COSTS', quantity: 2.71 },
    { id: 'IMG-PROD-120-PP-001', productId: 'IMG-PROD-120', materialId: 'PP-001', quantity: 0.0170 },
    { id: 'IMG-PROD-120-OTHER-COSTS', productId: 'IMG-PROD-120', materialId: 'OTHER-COSTS', quantity: 2.90 },
    { id: 'IMG-PROD-121-PP-001', productId: 'IMG-PROD-121', materialId: 'PP-001', quantity: 0.0260 },
    { id: 'IMG-PROD-121-OTHER-COSTS', productId: 'IMG-PROD-121', materialId: 'OTHER-COSTS', quantity: 3.85 },
    { id: 'IMG-PROD-122-PP-001', productId: 'IMG-PROD-122', materialId: 'PP-001', quantity: 0.0218 },
    { id: 'IMG-PROD-122-OTHER-COSTS', productId: 'IMG-PROD-122', materialId: 'OTHER-COSTS', quantity: 4.01 },
    { id: 'IMG-PROD-123-IMG-MAT-086', productId: 'IMG-PROD-123', materialId: 'IMG-MAT-086', quantity: 0.0410 },
    { id: 'IMG-PROD-123-OTHER-COSTS', productId: 'IMG-PROD-123', materialId: 'OTHER-COSTS', quantity: 1.76 },
    { id: 'IMG-PROD-124-IMG-MAT-086', productId: 'IMG-PROD-124', materialId: 'IMG-MAT-086', quantity: 0.0690 },
    { id: 'IMG-PROD-124-OTHER-COSTS', productId: 'IMG-PROD-124', materialId: 'OTHER-COSTS', quantity: 2.94 },
    { id: 'IMG-PROD-125-IMG-MAT-086', productId: 'IMG-PROD-125', materialId: 'IMG-MAT-086', quantity: 0.0810 },
    { id: 'IMG-PROD-125-OTHER-COSTS', productId: 'IMG-PROD-125', materialId: 'OTHER-COSTS', quantity: 4.33 },
    { id: 'IMG-PROD-126-IMG-MAT-086', productId: 'IMG-PROD-126', materialId: 'IMG-MAT-086', quantity: 0.1160 },
    { id: 'IMG-PROD-126-OTHER-COSTS', productId: 'IMG-PROD-126', materialId: 'OTHER-COSTS', quantity: 4.20 },
    { id: 'IMG-PROD-127-IMG-MAT-086', productId: 'IMG-PROD-127', materialId: 'IMG-MAT-086', quantity: 0.1180 },
    { id: 'IMG-PROD-127-OTHER-COSTS', productId: 'IMG-PROD-127', materialId: 'OTHER-COSTS', quantity: 5.57 },
    { id: 'IMG-PROD-128-IMG-MAT-083', productId: 'IMG-PROD-128', materialId: 'IMG-MAT-083', quantity: 0.0950 },
    { id: 'IMG-PROD-128-OTHER-COSTS', productId: 'IMG-PROD-128', materialId: 'OTHER-COSTS', quantity: 2.38 },
    { id: 'IMG-PROD-129-IMG-MAT-083', productId: 'IMG-PROD-129', materialId: 'IMG-MAT-083', quantity: 0.1410 },
    { id: 'IMG-PROD-129-OTHER-COSTS', productId: 'IMG-PROD-129', materialId: 'OTHER-COSTS', quantity: 3.36 },
    { id: 'IMG-PROD-130-IMG-MAT-083', productId: 'IMG-PROD-130', materialId: 'IMG-MAT-083', quantity: 0.1670 },
    { id: 'IMG-PROD-130-OTHER-COSTS', productId: 'IMG-PROD-130', materialId: 'OTHER-COSTS', quantity: 3.94 },
    { id: 'IMG-PROD-131-IMG-MAT-083', productId: 'IMG-PROD-131', materialId: 'IMG-MAT-083', quantity: 0.1880 },
    { id: 'IMG-PROD-131-OTHER-COSTS', productId: 'IMG-PROD-131', materialId: 'OTHER-COSTS', quantity: 4.40 },
    { id: 'IMG-PROD-132-IMG-MAT-083', productId: 'IMG-PROD-132', materialId: 'IMG-MAT-083', quantity: 0.2110 },
    { id: 'IMG-PROD-132-OTHER-COSTS', productId: 'IMG-PROD-132', materialId: 'OTHER-COSTS', quantity: 4.89 },
];

const initialState: State = {
  materials: [
    { id: 'PP-001', name: 'เม็ดพลาสติก PP สีดำ', unit: 'กิโลกรัม', pricePerUnit: 55.50, stockQuantity: 500 },
    { id: 'ABS-002', name: 'เม็ดพลาสติก ABS สีขาว', unit: 'กิโลกรัม', pricePerUnit: 82.00, stockQuantity: 350 },
    { id: 'COLOR-BLUE', name: 'แม่สีน้ำเงิน', unit: 'กรัม', pricePerUnit: 0.75, stockQuantity: 10000 },
    { id: 'SCREW-M3', name: 'สกรู M3', unit: 'ชิ้น', pricePerUnit: 1.25, stockQuantity: 25000 },
    { id: 'OTHER-COSTS', name: 'ต้นทุนอื่นๆ/ส่วนต่าง', unit: 'เหมา', pricePerUnit: 1, stockQuantity: 999999 },
    ...newMaterialsFromImage.map(m => ({...m, stockQuantity: Math.random() > 0.5 ? 1000 : 2000 }))
  ],
  products: [
    { id: 'PROD-001', name: 'ฝาครอบมอเตอร์', imageUrl: 'https://picsum.photos/seed/PROD-001/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    { id: 'PROD-002', name: 'ฐานยึดอุปกรณ์', imageUrl: 'https://picsum.photos/seed/PROD-002/400/300', totalMaterialCost: 0, sellingPrice: 0 },
    ...newProductsFromImage
  ],
  bomComponents: [
    { id: 'PROD-001-PP-001', productId: 'PROD-001', materialId: 'PP-001', quantity: 0.150 },
    { id: 'PROD-001-COLOR-BLUE', productId: 'PROD-001', materialId: 'COLOR-BLUE', quantity: 5 },
    { id: 'PROD-002-ABS-002', productId: 'PROD-002', materialId: 'ABS-002', quantity: 0.250 },
    { id: 'PROD-002-SCREW-M3', productId: 'PROD-002', materialId: 'SCREW-M3', quantity: 4 },
    ...newBomComponentsFromImage
  ],
};

// --- Helper function for cost calculation ---
const calculateAllProductCosts = (products: Product[], bomComponents: BomComponent[], materials: Material[]): Product[] => {
    return products.map(product => {
        const productBOMs = bomComponents.filter(bom => bom.productId === product.id);
        const totalCost = productBOMs.reduce((sum, bom) => {
            const material = materials.find(m => m.id === bom.materialId);
            if (material) {
                return sum + (bom.quantity * material.pricePerUnit);
            }
            return sum;
        }, 0);
        // Keep existing sellingPrice when recalculating cost
        return { ...product, totalMaterialCost: totalCost };
    });
};

const bomReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_MATERIAL':
      return { ...state, materials: [...state.materials, action.payload] };
    
    case 'UPDATE_MATERIAL': {
      const newMaterials = state.materials.map(m => m.id === action.payload.id ? action.payload : m);
      const updatedProducts = calculateAllProductCosts(state.products, state.bomComponents, newMaterials);
      return {
        ...state,
        materials: newMaterials,
        products: updatedProducts,
      };
    }

    case 'DELETE_MATERIAL': {
      const remainingBoms = state.bomComponents.filter(bom => bom.materialId !== action.payload);
      const remainingMaterials = state.materials.filter(m => m.id !== action.payload);
      const updatedProducts = calculateAllProductCosts(state.products, remainingBoms, remainingMaterials);
      return {
        ...state,
        materials: remainingMaterials,
        bomComponents: remainingBoms,
        products: updatedProducts,
      };
    }

    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };

    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) };
    
    case 'DELETE_PRODUCT':
      // No recalculation needed as product and its BOMs are gone
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
        bomComponents: state.bomComponents.filter(bom => bom.productId !== action.payload),
      };

    case 'ADD_BOM_COMPONENT': {
      const newBomComponents = [...state.bomComponents, action.payload];
      const updatedProducts = calculateAllProductCosts(state.products, newBomComponents, state.materials);
      return {
        ...state,
        bomComponents: newBomComponents,
        products: updatedProducts,
      };
    }
    
    case 'UPDATE_BOM_COMPONENT': {
      const newBomComponents = state.bomComponents.map(b => b.id === action.payload.id ? action.payload : b);
      const updatedProducts = calculateAllProductCosts(state.products, newBomComponents, state.materials);
      return {
        ...state,
        bomComponents: newBomComponents,
        products: updatedProducts,
      };
    }

    case 'DELETE_BOM_COMPONENT': {
      const newBomComponents = state.bomComponents.filter(b => b.id !== action.payload);
      const updatedProducts = calculateAllProductCosts(state.products, newBomComponents, state.materials);
      return {
        ...state,
        bomComponents: newBomComponents,
        products: updatedProducts,
      };
    }
    
    case 'COPY_BOM_COMPONENTS': {
      const { sourceProductId, targetProductId } = action.payload;

      const sourceBoms = state.bomComponents.filter(bom => bom.productId === sourceProductId);
      const targetBomMaterialIds = new Set(
        state.bomComponents.filter(bom => bom.productId === targetProductId).map(bom => bom.materialId)
      );

      const newComponents = sourceBoms
        .filter(sourceBom => !targetBomMaterialIds.has(sourceBom.materialId))
        .map(sourceBom => ({
          ...sourceBom,
          id: `${targetProductId}-${sourceBom.materialId}`,
          productId: targetProductId,
        }));

      if (newComponents.length === 0) {
        return state; // Avoids recalculation if nothing changes
      }

      const newBomComponents = [...state.bomComponents, ...newComponents];
      const updatedProducts = calculateAllProductCosts(state.products, newBomComponents, state.materials);

      return {
        ...state,
        bomComponents: newBomComponents,
        products: updatedProducts,
      };
    }

    default:
      return state;
  }
};

const initializer = (): State => {
  let stateToInitialize: State;
  try {
    const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedState) {
        stateToInitialize = JSON.parse(storedState);
    } else {
        stateToInitialize = initialState;
    }
  } catch (error) {
    console.error("Failed to parse state from localStorage, using initial data.", error);
    stateToInitialize = initialState;
  }

  // Ensure all materials have an image URL and stock quantity for consistent display
  stateToInitialize.materials = stateToInitialize.materials.map(material => ({
    ...material,
    imageUrl: material.imageUrl || `https://picsum.photos/seed/${material.id}/200`,
    stockQuantity: material.stockQuantity ?? 0,
  }));
  
  // Recalculate costs on load to ensure data integrity
  const recalculatedProducts = calculateAllProductCosts(stateToInitialize.products, stateToInitialize.bomComponents, stateToInitialize.materials);
  return { ...stateToInitialize, products: recalculatedProducts };
};

const BomContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);


type BomProviderProps = {
    children: ReactNode;
};

export const BomProvider = ({ children }: BomProviderProps) => {
  const [state, dispatch] = useReducer(bomReducer, undefined, initializer);

  useEffect(() => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error("Failed to save state to localStorage", error);
    }
  }, [state]);

  return (
    <BomContext.Provider value={{ state, dispatch }}>
      {children}
    </BomContext.Provider>
  );
};

export const useBom = () => {
  const context = useContext(BomContext);
  if (context === undefined) {
    throw new Error('useBom must be used within a BomProvider');
  }
  return context;
};
