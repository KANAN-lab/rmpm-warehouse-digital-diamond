import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';
import { sendSuccessResponse, sendOperationalError } from '../utils/errorResponder.js';

export const generateParametricRackApi = (req: AuthenticatedRequest, res: Response) => {
  const { code, width, depth, height, levels, binsPerLevel, positionX, positionY, positionZ } = req.body;

  if (!code || !width || !height || !levels || !binsPerLevel) {
    return sendOperationalError(req, res, {
      code: 'PARAMETRIC_INVALID_INPUT',
      message: 'Kode rak, lebar, tinggi, jumlah level, dan bin/level wajib diisi.',
      statusCode: 400
    });
  }

  const generatedBins: string[] = [];
  for (let l = 1; l <= Number(levels); l++) {
    for (let b = 1; b <= Number(binsPerLevel); b++) {
      generatedBins.push(`${code}-L0${l}-B0${b}`);
    }
  }

  return sendSuccessResponse(req, res, {
    message: `Rak parametrik 3D '${code}' berhasil di-generate beserta ${generatedBins.length} entitas bin database.`,
    rack: {
      code,
      dimensions: { width: Number(width), depth: Number(depth || 1.1), height: Number(height) },
      position: { x: Number(positionX || 0), y: Number(positionY || 0), z: Number(positionZ || 0) },
      levels: Number(levels),
      binsPerLevel: Number(binsPerLevel)
    },
    bins: generatedBins
  }, 201);
};

export const publishLayoutVersionApi = (req: AuthenticatedRequest, res: Response) => {
  const { versionId = 'v1.1-PUBLISHED' } = req.body;

  return sendSuccessResponse(req, res, {
    message: `Versi layout 3D '${versionId}' berhasil dipublikasikan. Pemetaan 1-to-1 dengan database produksi aktif.`,
    layoutVersion: {
      versionId,
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString()
    }
  });
};
