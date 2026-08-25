import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';
import { sendSuccessResponse, sendOperationalError } from '../utils/errorResponder.js';
import { 
  mockLocationTree, 
  findLocationNode, 
  generateLocationCodes, 
  validateLocationCapacity 
} from '../services/locationHierarchyService.js';

// Get Full Recursive Location Tree
export const getLocationTree = (req: AuthenticatedRequest, res: Response) => {
  return sendSuccessResponse(req, res, {
    tree: mockLocationTree
  });
};

// Find Location Node & Path Breadcrumb
export const getLocationPath = (req: AuthenticatedRequest, res: Response) => {
  const { idOrCode } = req.params;
  const node = findLocationNode(mockLocationTree, idOrCode);

  if (!node) {
    return sendOperationalError(req, res, {
      code: 'LOCATION_NOT_FOUND',
      message: `Lokasi gudang '${idOrCode}' tidak ditemukan di database.`,
      statusCode: 404
    });
  }

  return sendSuccessResponse(req, res, {
    node,
    breadcrumb: `WH-RMPM-01 > ZONE-A > RACK-A01 > ${node.code}`
  });
};

// Batch Generate Barcodes & QR Codes for Location
export const generateCodesForLocation = (req: AuthenticatedRequest, res: Response) => {
  const { code, locationType } = req.body;

  if (!code || !locationType) {
    return sendOperationalError(req, res, {
      code: 'LOCATION_CODE_MISSING',
      message: 'Kode lokasi dan jenis lokasi wajib diisi.',
      statusCode: 400
    });
  }

  const generated = generateLocationCodes(code, locationType);

  return sendSuccessResponse(req, res, {
    code,
    locationType,
    barcode: generated.barcode,
    qrCode: generated.qrCode
  });
};

// Validate Location Capacity Before Physical Movement
export const checkLocationCapacityValidation = (req: AuthenticatedRequest, res: Response) => {
  const { locationCode, additionalWeight, additionalVolume, additionalPallets = 1 } = req.body;

  const node = findLocationNode(mockLocationTree, locationCode);
  if (!node) {
    return sendOperationalError(req, res, {
      code: 'LOCATION_NOT_FOUND',
      message: `Lokasi gudang '${locationCode}' tidak ditemukan untuk pemeriksaan kapasitas.`,
      statusCode: 404
    });
  }

  const validation = validateLocationCapacity(
    node,
    Number(additionalWeight || 0),
    Number(additionalVolume || 0),
    Number(additionalPallets || 1)
  );

  if (!validation.isValid) {
    return sendOperationalError(req, res, {
      code: 'CAPACITY_OVERFLOW',
      message: validation.reason || 'Kapasitas lokasi tidak mencukupi.',
      statusCode: 400,
      details: {
        locationCode,
        currentWeight: node.currentWeight,
        maxWeight: node.maxWeight
      }
    });
  }

  return sendSuccessResponse(req, res, {
    isValid: true,
    message: `Lokasi '${locationCode}' berstatus AKTIF dan kapasitas mencukupi untuk pemindahan barang.`
  });
};
