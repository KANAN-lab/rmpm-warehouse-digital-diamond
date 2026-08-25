import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/correlationId.js';
import { sendSuccessResponse, sendOperationalError } from '../utils/errorResponder.js';

export const mock3dLayoutObjects = [
  { id: 'OBJ-RACK-A01', type: 'RACK', businessCode: 'RACK-A01', x: -12, y: 0, z: 0, width: 2.7, depth: 1.1, height: 6.0 },
  { id: 'OBJ-RACK-A02', type: 'RACK', businessCode: 'RACK-A02', x: -4, y: 0, z: 0, width: 2.7, depth: 1.1, height: 6.0 },
  { id: 'OBJ-RACK-B01', type: 'RACK', businessCode: 'RACK-B01', x: 4, y: 0, z: 0, width: 2.7, depth: 1.1, height: 6.0 },
  { id: 'OBJ-RACK-B02', type: 'RACK', businessCode: 'RACK-B02', x: 12, y: 0, z: 0, width: 2.7, depth: 1.1, height: 6.0 }
];

export const getActive3dLayout = (req: AuthenticatedRequest, res: Response) => {
  return sendSuccessResponse(req, res, {
    version: 'v1.0-published',
    publishedAt: new Date().toISOString(),
    objects: mock3dLayoutObjects
  });
};

export const get3dHeatmapData = (req: AuthenticatedRequest, res: Response) => {
  const { layer = 'Inventory Density' } = req.query;

  return sendSuccessResponse(req, res, {
    layer,
    colorMappingTheme: {
      GREEN: 'Normal / High Accuracy',
      YELLOW: 'Pending Count / Warning',
      ORANGE: 'Variance Recount Required',
      RED: 'Wrong Location Exception',
      PURPLE: 'Missing Stock',
      BLUE: 'Active Inspection'
    },
    binColors: [
      { binCode: 'A01-R03-L02-B04', colorHex: '#ef4444', status: 'WRONG_LOCATION' },
      { binCode: 'B02-R01-L03-B02', colorHex: '#f59e0b', status: 'VARIANCE' },
      { binCode: 'A01-R01-L01-B01', colorHex: '#10b981', status: 'NORMAL' }
    ]
  });
};
