"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLocationCapacity = exports.generateLocationCodes = exports.findLocationNode = exports.mockLocationTree = void 0;
// In-Memory Location Nodes Hierarchy Storage for Service Execution
exports.mockLocationTree = [
    {
        id: 'loc-wh-01',
        code: 'WH-RMPM-01',
        name: 'Main RMPM Warehouse',
        locationType: 'WAREHOUSE',
        barcode: 'BC-WH-01',
        maxWeight: 1000000,
        maxVolume: 50000,
        maxPallets: 5000,
        currentWeight: 150000,
        currentVolume: 8000,
        currentPallets: 850,
        status: 'ACTIVE',
        children: [
            {
                id: 'loc-zone-a',
                code: 'ZONE-A',
                name: 'Zone A - Dry Raw Material Storage',
                locationType: 'ZONE',
                parentLocationId: 'loc-wh-01',
                barcode: 'BC-ZONE-A',
                maxWeight: 500000,
                maxVolume: 20000,
                maxPallets: 2000,
                currentWeight: 80000,
                currentVolume: 3500,
                currentPallets: 400,
                status: 'ACTIVE',
                children: [
                    {
                        id: 'loc-rack-a01',
                        code: 'RACK-A01',
                        name: 'Pallet Rack A01',
                        locationType: 'RACK',
                        parentLocationId: 'loc-zone-a',
                        barcode: 'BC-RACK-A01',
                        maxWeight: 10000,
                        maxVolume: 50,
                        maxPallets: 20,
                        currentWeight: 4500,
                        currentVolume: 22,
                        currentPallets: 9,
                        status: 'ACTIVE',
                        children: [
                            {
                                id: 'loc-bin-a01-l02-b04',
                                code: 'A01-R03-L02-B04',
                                name: 'Bin A01-R03-L02-B04',
                                locationType: 'BIN',
                                parentLocationId: 'loc-rack-a01',
                                barcode: 'A01-R03-L02-B04',
                                qrCode: 'QR-A01-R03-L02-B04',
                                maxWeight: 1000,
                                maxVolume: 5,
                                maxPallets: 1,
                                currentWeight: 980,
                                currentVolume: 3.2,
                                currentPallets: 1,
                                status: 'ACTIVE',
                                children: []
                            }
                        ]
                    }
                ]
            }
        ]
    }
];
// Helper to find location node recursively
const findLocationNode = (nodes, idOrCode) => {
    for (const node of nodes) {
        if (node.id === idOrCode || node.code === idOrCode || node.barcode === idOrCode) {
            return node;
        }
        if (node.children && node.children.length > 0) {
            const found = (0, exports.findLocationNode)(node.children, idOrCode);
            if (found)
                return found;
        }
    }
    return null;
};
exports.findLocationNode = findLocationNode;
// Automatic Barcode & QR Code Generator
const generateLocationCodes = (code, locationType) => {
    const cleanCode = code.toUpperCase().replace(/\s+/g, '-');
    return {
        barcode: `BC-${locationType.substring(0, 3)}-${cleanCode}`,
        qrCode: `QR-RMPM-${locationType.substring(0, 3)}-${cleanCode}-${Date.now().toString().slice(-4)}`
    };
};
exports.generateLocationCodes = generateLocationCodes;
// Capacity Validation Engine
const validateLocationCapacity = (location, additionalWeight, additionalVolume, additionalPallets = 1) => {
    if (location.status !== 'ACTIVE') {
        return {
            isValid: false,
            reason: `Lokasi '${location.code}' saat ini berstatus '${location.status}' dan tidak dapat digunakan.`
        };
    }
    if (location.currentWeight + additionalWeight > location.maxWeight) {
        return {
            isValid: false,
            reason: `Kapasitas berat terlampaui! (Maksimum: ${location.maxWeight} kg, Tambahan: ${additionalWeight} kg, Saat ini: ${location.currentWeight} kg).`
        };
    }
    if (location.currentVolume + additionalVolume > location.maxVolume) {
        return {
            isValid: false,
            reason: `Kapasitas volume terlampaui! (Maksimum: ${location.maxVolume} m³, Tambahan: ${additionalVolume} m³, Saat ini: ${location.currentVolume} m³).`
        };
    }
    if (location.currentPallets + additionalPallets > location.maxPallets) {
        return {
            isValid: false,
            reason: `Batas palet terlampaui! (Maksimum: ${location.maxPallets} palet, Tambahan: ${additionalPallets} palet).`
        };
    }
    return { isValid: true };
};
exports.validateLocationCapacity = validateLocationCapacity;
