export type Lane = 'nationwide' | 'hot_zone';

export type ShipmentStatusValue = 'created' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';

export interface Shipment {
  courierProvider: string;
  trackingNo: string;
  lane: Lane;
  status: ShipmentStatusValue;
  shippedAt: Date | null;
  deliveredAt: Date | null;
}

export interface ShipmentOrder {
  id: string;
  address: string;
  items: { sku: string; qty: number; weightG: number }[];
  lane: Lane;
}

export interface CourierProvider {
  createShipment(order: ShipmentOrder): Promise<Shipment>;
  trackShipment(trackingNo: string): Promise<Pick<Shipment, 'status' | 'deliveredAt'>>;
}
