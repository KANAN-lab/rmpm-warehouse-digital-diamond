import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';
import { sendSuccessResponse, sendOperationalError } from '../utils/errorResponder.js';

// In-Memory Seed Storage for Master Data (Simulating Database Entity Tables)
export interface MasterEntity {
  id: string;
  code: string;
  name: string;
  category?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

let mockBins: MasterEntity[] = [
  { id: 'bin-001', code: 'A01-R01-L01-B01', name: 'Bin A01-R01-L01-B01', barcode: 'A01-R01-L01-B01', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-002', code: 'A01-R01-L01-B02', name: 'Bin A01-R01-L01-B02', barcode: 'A01-R01-L01-B02', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-003', code: 'A01-R03-L02-B04', name: 'Bin A01-R03-L02-B04', barcode: 'A01-R03-L02-B04', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

let mockMaterials: MasterEntity[] = [
  { id: 'mat-001', code: 'RM-RESIN-001', name: 'Polypropylene Resin Pellets', category: 'Raw Materials', uom: 'KG', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'mat-002', code: 'PM-BOTTLE-500', name: 'PET Preform Bottle 500ml', category: 'Packaging Materials', uom: 'PCS', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

// LIST & SEARCH MASTER DATA
export const listMasterData = (req: AuthenticatedRequest, res: Response) => {
  const { entity, search, status, page = 1, limit = 10 } = req.query;
  const targetDataset = entity === 'materials' ? mockMaterials : mockBins;
  
  let result = [...targetDataset];

  if (status) {
    result = result.filter(item => item.status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(item => 
      item.code.toLowerCase().includes(q) || 
      item.name.toLowerCase().includes(q)
    );
  }

  const total = result.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const paginated = result.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return sendSuccessResponse(req, res, {
    items: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    }
  });
};

// CREATE MASTER DATA
export const createMasterData = (req: AuthenticatedRequest, res: Response) => {
  const { entity, code, name, category, barcode } = req.body;

  if (!code || !name) {
    return sendOperationalError(req, res, {
      code: 'MASTER_INVALID_INPUT',
      message: 'Kode dan Nama Master Data wajib diisi.',
      statusCode: 400
    });
  }

  const newItem: MasterEntity = {
    id: `item-${Date.now()}`,
    code,
    name,
    category,
    barcode: barcode || code,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (entity === 'materials') {
    mockMaterials.push(newItem);
  } else {
    mockBins.push(newItem);
  }

  return sendSuccessResponse(req, res, newItem, 201);
};

// SOFT DELETE MASTER DATA (ACTIVE -> INACTIVE / ARCHIVED)
export const softDeleteMasterData = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { entity, newStatus = 'INACTIVE' } = req.body;

  const dataset = entity === 'materials' ? mockMaterials : mockBins;
  const target = dataset.find(item => item.id === id);

  if (!target) {
    return sendOperationalError(req, res, {
      code: 'MASTER_NOT_FOUND',
      message: `Master data dengan ID '${id}' tidak ditemukan.`,
      statusCode: 404
    });
  }

  target.status = newStatus as any;
  target.updatedAt = new Date().toISOString();

  return sendSuccessResponse(req, res, {
    message: `Master data '${target.code}' berhasil diperbarui statusnya menjadi '${newStatus}'.`,
    item: target
  });
};

// STAGING IMPORT VALIDATION FOR CSV/EXCEL
export const validateImportData = (req: AuthenticatedRequest, res: Response) => {
  const { rows } = req.body;
  
  if (!Array.isArray(rows) || rows.length === 0) {
    return sendOperationalError(req, res, {
      code: 'IMPORT_EMPTY_DATA',
      message: 'Tidak ada baris data untuk divalidasi.',
      statusCode: 400
    });
  }

  const validRows: any[] = [];
  const invalidRows: any[] = [];
  const duplicates: any[] = [];

  rows.forEach((row, idx) => {
    if (!row.code || !row.name) {
      invalidRows.push({ rowIndex: idx + 1, row, reason: 'Kode atau nama kosong' });
    } else if (mockBins.some(b => b.code === row.code)) {
      duplicates.push({ rowIndex: idx + 1, row, reason: 'Kode sudah terdaftar di database' });
    } else {
      validRows.push({ rowIndex: idx + 1, row });
    }
  });

  return sendSuccessResponse(req, res, {
    summary: {
      totalRows: rows.length,
      validCount: validRows.length,
      invalidCount: invalidRows.length,
      duplicateCount: duplicates.length,
      canCommit: invalidRows.length === 0 && duplicates.length === 0
    },
    validRows,
    invalidRows,
    duplicates
  });
};
