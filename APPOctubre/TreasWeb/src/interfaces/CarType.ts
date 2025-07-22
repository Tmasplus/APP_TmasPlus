// src/types/CarType.ts
export interface Option {
    amount: number;
    description: string;
    tableData?: {
      id: number;
    };
  }
  
  export interface CarType {
    id: string;
    Iva?: number;
    base_fare: number;
    convenience_fee_type: string;
    convenience_fees: number;
    createdAt: number;
    extra_info: string;
    fleet_admin_fee?: number;
    image: string;
    min_fare: number;
    name: string;
    options: Option[];
    parcelTypes?: Option[];
    pos?: number;
    rate_per_hour: number;
    rate_per_unit_distance: number;
    recargo_aeropuerto?: number;
    recargo_programado?: number;
    typeService: string;
  }
  