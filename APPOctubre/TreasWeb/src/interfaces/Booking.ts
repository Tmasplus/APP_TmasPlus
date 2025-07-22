export interface Booking {
    uid: string;
    bookingDate: number;
    booking_type_admin: boolean;
    carImage: string;
    carType: string;
    cardPaymentAmount: number;
    cashPaymentAmount: string;
    convenience_fees: number;
    coords: { lat: number, lng: number }[];
    customer: string;
    customer_contact: string;
    customer_email: string;
    customer_image: string;
    customer_name: string;
    customer_paid: string;
    customer_token: string;
    discount: string;
    discount_amount: string;
    distance: string;
    driver: string;
    driverRating: string;
    driver_contact: string;
    driver_image: string;
    driver_name: string;
    driver_share: string;
    driver_token: string;
    drop: { add: string, lat: number, lng: number };
    dropAddress: string;
    endTime: number;
    estimate: string;
    estimateDistance: string;
    estimateTime: number;
    fleetadmin: string;
    id: string;
    otp: number;
    payableAmount: string;
    payment_mode: string;
    pickup: { add: string, lat: number, lng: number };
    pickupAddress: string;
    promo_applied: boolean;
    promo_details: {
      id: string;
      max_promo_discount_value: number;
      min_order: number;
      promo_description: string;
      promo_discount_type: string;
      promo_value: number;
    };
    rating: number;
    startTime: number;
    status: string;
    total_trip_time: number;
    trip_cost: string;
    trip_end_time: string;
    trip_start_time: string;
    tripdate: number;
    usedWalletMoney: string;
    vehicle_number: string;
    cost_corp:number;
    comisioCompany:number;
    Technological_Hosting:number;
    Base_de_IVA:number;
    Iva:number;
    PolicyPackage:number;
    reference:string;
    tripType:string;
    booking_from_web?: boolean; // Agregar esta propiedad
    bookLater?: boolean; // Agregar esta propiedad

  }
  
