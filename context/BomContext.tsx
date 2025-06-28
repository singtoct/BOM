
import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { State, Action, Material, Product, BomComponent } from '../types';

const LOCAL_STORAGE_KEY = 'bom-app-data';

// --- Data from User ---
const userProductData = [
    { name: 'บล็อคลอย G-Power 2x4', weight: 45.80, price: 3.69 },
    { name: 'บล็อคลอย G-Power 4x4', weight: 62.60, price: 5.08 },
    { name: 'บล็อคลอย G-Power 2x4B', weight: 45.80, price: 3.70 },
    { name: 'บล็อคลอย G-Power 4x4B', weight: 62.60, price: 5.20 },
    { name: 'บล็อคลอย CT 2x4', weight: 45.80, price: 3.83 },
    { name: 'บล็อคลอย CT 4x4', weight: 62.60, price: 5.08 },
    { name: 'บล็อคลอย CT 2x4B', weight: 45.80, price: 3.70 },
    { name: 'บล็อคลอย CT 4x4B', weight: 62.60, price: 5.20 },
    { name: 'ฝาหน้ากาก CT A-101', weight: 18.50, price: 3.77 },
    { name: 'ฝาหน้ากาก CT A-101B', weight: 18.50, price: 0 },
    { name: 'ฝาหน้ากาก CT A-102', weight: 17.00, price: 3.70 },
    { name: 'ฝาหน้ากาก CT A-102B', weight: 17.00, price: 0 },
    { name: 'ฝาหน้ากาก CT A-103', weight: 15.50, price: 3.57 },
    { name: 'ฝาหน้ากาก CT A-103B', weight: 15.50, price: 3.35 },
    { name: 'ฝาหน้ากาก CT A-1022', weight: 17.00, price: 3.92 },
    { name: 'ฝาหน้ากาก CT A-1022B', weight: 17.00, price: 0 },
    { name: 'ฝาหน้ากาก CT A-104', weight: 26.00, price: 4.92 },
    { name: 'ฝาหน้ากาก CT A-104B', weight: 26.00, price: 0 },
    { name: 'ฝาหน้ากาก CT A-106', weight: 21.80, price: 5.02 },
    { name: 'ฝาหน้ากาก CT A-106B', weight: 21.80, price: 0 },
    { name: 'บล็อคลอย BEWON  2x4', weight: 45.80, price: 3.83 },
    { name: 'บล็อคลอย BEWON 4x4', weight: 62.60, price: 5.32 },
    { name: 'ฝาหน้ากาก BEWON 201', weight: 18.50, price: 3.68 },
    { name: 'ฝาหน้ากาก BEWON 202', weight: 17.00, price: 3.60 },
    { name: 'ฝาหน้ากาก BEWON 203', weight: 15.50, price: 3.57 },
    { name: 'ฝาหน้ากาก BEWON 222', weight: 17.00, price: 3.84 },
    { name: 'ฝาหน้ากาก BEWON 604', weight: 26.00, price: 5.29 },
    { name: 'ฝาหน้ากาก BEWON 606', weight: 21.80, price: 5.22 },
    { name: 'ฝาเทาใส CHONG-2  PC', weight: 41.00, price: 4.01 },
    { name: 'ฝาเทาใส CHONG-4  PC', weight: 69.00, price: 6.73 },
    { name: 'ฝาเทาใส CHONG-6  PC', weight: 81.00, price: 8.78 },
    { name: 'ฝาเทาใส CHONG-8  PC', weight: 116.00, price: 10.58 },
    { name: 'ฝาเทาใส CHONG-10  PC', weight: 118.00, price: 12.06 },
    { name: 'ฝาขาว CHONG-2  ABS', weight: 95.00, price: 6.75 },
    { name: 'ฝาขาว CHONG-4  ABS', weight: 141.00, price: 9.85 },
    { name: 'ฝาขาว CHONG-6  ABS', weight: 167.00, price: 11.62 },
    { name: 'ฝาขาว CHONG-8  ABS', weight: 188.00, price: 13.04 },
    { name: 'ฝาขาว CHONG-10  ABS', weight: 211.00, price: 14.60 },
    { name: 'CTU ฝา NEW 2 ดำใส PC', weight: 40.00, price: 4.74 },
    { name: 'CTU ฝา NEW 4 ดำใส PC', weight: 55.00, price: 5.97 },
    { name: 'CTU ฝา NEW 6 ดำใส PC', weight: 65.00, price: 6.54 },
    { name: 'CTU ฝา NEW 8 ดำใส PC', weight: 75.00, price: 7.40 },
    { name: 'CTU ฝา NEW 10 ดำใส PC', weight: 85.00, price: 10.00 },
    { name: 'CTU ฝา NEW 2 สีขาว PC', weight: 105.00, price: 8.80 },
    { name: 'CTU ฝา NEW 4 สีขาว PC', weight: 170.00, price: 14.87 },
    { name: 'CTU ฝา NEW 6 สีขาว PC', weight: 185.00, price: 16.70 },
    { name: 'CTU ฝา NEW 8 สีขาว PC', weight: 210.00, price: 17.96 },
    { name: 'CTU ฝา NEW 10 สีขาว PC', weight: 240.00, price: 23.53 },
    { name: 'อุปกร์ฝาใส่ตู้', weight: 1.10, price: 0.44 },
    { name: 'ฝาใส   M 4', weight: 75.00, price: 6.73 },
    { name: 'ฝาใส   M 6', weight: 89.00, price: 7.88 },
    { name: 'ฝาใส   M 8', weight: 110.00, price: 9.60 },
    { name: 'ฝาใส   M 10', weight: 122.00, price: 10.58 },
    { name: 'ฝาใส   M 12', weight: 123.00, price: 11.16 },
    { name: 'ฝาใสเทา   M 4', weight: 75.00, price: 12.74 },
    { name: 'ฝาใสเทา   M 6', weight: 89.00, price: 14.84 },
    { name: 'ฝาใสเทา   M 8', weight: 110.00, price: 17.97 },
    { name: 'ฝาใสเทา   M 10', weight: 122.00, price: 19.77 },
    { name: 'ฝาใสเทา   M 12', weight: 123.00, price: 20.82 },
    { name: 'ชุดล็อคเลือนเลื่อนเปิด-ปิด     K1', weight: 2.80, price: 0.58 },
    { name: 'ชุดฐานล็อคเลือนเลื่อนเปิด-ปิด  K2', weight: 6.90, price: 0.77 },
    { name: 'ฐานรองเบเกอร์เมน    R1', weight: 65.00, price: 5.05 },
    { name: 'ฝาบิดบัสบาร์เมน         R1-1', weight: 6.00, price: 0.92 },
    { name: 'ฐานรองเบรคย่อย  T1', weight: 15.80, price: 1.97 },
    { name: 'ฝาปิดบัสบาร์ 2 ช่อง T1-1', weight: 1.60, price: 0.36 },
    { name: 'ขาล็อคข้อพับเปิด-ปิดฝา  S1', weight: 0.80, price: 0.33 },
    { name: 'ขาพับเปิด-ปิดฝา               S2', weight: 1.30, price: 0.35 },
    { name: 'ฐานรองเบเกอร์    4  ช่อง  C1', weight: 45.20, price: 3.65 },
    { name: 'ฝาปิดบัสบาร์ C1-1', weight: 3.80, price: 0.56 },
    { name: 'ฐานรองขั้วต่อสาย   J1', weight: 12.80, price: 1.01 },
    { name: 'ฐานรองขั้วต่อสาย   J2', weight: 21.20, price: 1.63 },
    { name: ' GNT  เบรคเกอร์', weight: 42.00, price: 4.53 },
    { name: 'CWS-111  ฝาครอบด้านหน้า', weight: 2.60, price: 0.49 },
    { name: 'CWS-111  ฝาครอบด้านหน้า สีดำ', weight: 2.60, price: 0 },
    { name: 'CWS-111  ฝาครอบด้านหลัง ', weight: 6.70, price: 0.78 },
    { name: 'CWS-111  ชุดขาล็อคฝาครอบ', weight: 0.35, price: 0.30 },
    { name: 'CWS-111  ชุดล็อคขาเสียบ 2 ต่อ', weight: 0.25, price: 0.32 },
    { name: 'CWS-111  รองฝาเปิด-ปิดด้านในใหญ่', weight: 3.90, price: 0.30 },
    { name: 'CWS-111  รองฝาเปิด-ปิดด้านในเล็ก', weight: 2.70, price: 0.30 },
    { name: 'CWS-121  ฝาครอบด้านหน้า', weight: 2.60, price: 0.49 },
    { name: 'CWS-121  ฝาครอบด้านหน้า สีดำ', weight: 2.60, price: 0 },
    { name: 'CWS-121  ฝาครอบด้านหลัง ', weight: 6.70, price: 0.78 },
    { name: 'CWS-121  ชุดขาล็อคฝาครอบ', weight: 0.35, price: 0.30 },
    { name: 'CWS-121  ชุดล็อคขาเสียบสาย 2 ต่อ', weight: 0.25, price: 0.32 },
    { name: 'CWS-121  รองฝาเปิด-ปิดด้านในใหญ่', weight: 3.90, price: 0.30 },
    { name: 'CWS-121  รองฝาเปิด-ปิดด้านในเล็ก', weight: 2.70, price: 0.30 },
    { name: 'CPS-113  ฝาครอบด้านหน้า', weight: 11.20, price: 0.97 },
    { name: 'CPS-113  ฝาครอบด้านหลัง ', weight: 13.20, price: 1.02 },
    { name: 'CPS-113  ชุดขาล็อคฝาครอบ', weight: 0.60, price: 0.48 },
    { name: 'ชุดขาล็อคขาเสียบสาย  L', weight: 0.40, price: 0.30 },
    { name: 'ชุดขาล็อคขาเสียบสาย  N', weight: 0.40, price: 0.30 },
    { name: 'ชุดล็อคขาเสียบสาย G', weight: 0.35, price: 0.29 },
    { name: 'CPS-116  ฝาครอบด้านหน้า', weight: 17.40, price: 1.48 },
    { name: 'CPS-116  ฝาครอบด้านหลัง ', weight: 18.30, price: 1.54 },
    { name: 'CPS-116  ชุดขาล็อคฝาครอบ', weight: 0.60, price: 0.48 },
    { name: 'CPS-112  ฝาครอบด้านหน้า', weight: 5.60, price: 0.63 },
    { name: 'CPS-112  ฝาครอบด้านหลัง ', weight: 6.70, price: 0.78 },
    { name: 'CPS-112  ชุดขาล็อคฝาครอบ', weight: 0.55, price: 0.38 },
    { name: 'ชุดล็อคขาเสียบสาย', weight: 0.35, price: 0 },
    { name: 'รองครอบด้านใน', weight: 0.42, price: 0 },
    { name: 'บล็อคฝัง 2x4 สีดำ', weight: 0, price: 0 },
    { name: 'บล็อคฝัง 4x4 สีดำ', weight: 0, price: 0 },
    { name: 'บล็อคฝัง 2x4 สีส้ม', weight: 0, price: 0 },
    { name: 'บล็อคฝัง 4x4 สีส้ม', weight: 0, price: 0 },
];

const generateInitialData = () => {
  const products: Product[] = [];
  const bomComponents: BomComponent[] = [];

  userProductData.forEach((item, index) => {
    if (!item.name) return;
    const productId = `USER-PROD-${String(index + 1).padStart(3, '0')}`;
    
    products.push({
      id: productId,
      name: item.name.trim(),
      imageUrl: `https://picsum.photos/seed/${productId}/400/300`,
      totalMaterialCost: 0,
      sellingPrice: item.price,
    });

    if (item.weight > 0) {
      let materialId = 'IMG-MAT-093'; // Default to HIPS
      const upperName = item.name.toUpperCase();
      
      if (upperName.includes('PC')) {
        if (upperName.includes('ดำ')) materialId = 'IMG-MAT-090'; // PC Black
        else if (upperName.includes('เทา')) materialId = 'IMG-MAT-087'; // PC Grey
        else if (upperName.includes('ขาว')) materialId = 'IMG-MAT-088'; // PC White
        else materialId = 'IMG-MAT-086'; // PC Clear
      } else if (upperName.includes('ABS')) {
        if (upperName.includes('ดำ')) materialId = 'IMG-MAT-085'; // ABS Black
        else materialId = 'IMG-MAT-083'; // ABS White
      } else if (upperName.includes('POM')) {
        materialId = 'IMG-MAT-095'; // POM
      } else if (upperName.includes('HIPS')) {
         if (upperName.includes('ดำ')) materialId = 'IMG-MAT-094'; // HIPS Black
         else materialId = 'IMG-MAT-093'; // HIPS
      }

      bomComponents.push({
        id: `${productId}-${materialId}`,
        productId: productId,
        materialId: materialId,
        quantity: item.weight / 1000, // convert g to kg
      });
    }
  });

  return { products, bomComponents };
};

const { products: newProducts, bomComponents: newBomComponents } = generateInitialData();

const materialMasterList: Omit<Material, 'imageUrl' | 'stockQuantity'>[] = [
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
  { id: 'OTHER-COSTS', name: 'ต้นทุนอื่นๆ/ส่วนต่าง', unit: 'เหมา', pricePerUnit: 1 },
];

const initialState: State = {
  materials: materialMasterList.map(m => ({
    ...m,
    stockQuantity: Math.floor(Math.random() * 2500) + 500, // Random stock for demo
  })),
  products: newProducts,
  bomComponents: newBomComponents,
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
        return state;
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

  stateToInitialize.materials = stateToInitialize.materials.map(material => ({
    ...material,
    imageUrl: material.imageUrl || `https://picsum.photos/seed/${material.id}/200`,
    stockQuantity: material.stockQuantity ?? 0,
  }));
  
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
