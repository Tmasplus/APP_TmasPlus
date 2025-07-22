// src/store/types.ts
export interface UserProfile {
    uid: string;
    email: string | null;
    phoneNumber: string | null;
    usertype: string;
  }
  
  export interface DriverProfile extends UserProfile {
    carType: string;
    car_image: string;
    vehicleNumber: string;
    vehicleMake: string;
    firstName : string;
  }
  
  export interface CustomerProfile extends UserProfile {
    firstName: string;

    // Campos específicos de los clientes
  }
  
  interface SubUser {
    InTurn: boolean;
    Name: string;
    email: string;
    id: string;
    password: string;
  }
  
 export interface CompanyProfile extends UserProfile {
    uid: string;
    email: string;
    phoneNumber: string;
    usertype: string;
    bussinesName: string;
    commission: number;
    subusers?: SubUser[];
    profile_image:string;

  }
  
  

  export interface SecurityData {
    antecedents: Antecedent[];
    date: number;
    docType: string;
    firstName: string;
    lastName: string;
    verifyId: string;
  }
  export interface Antecedent {
    documento: string;
    entidad: string;
    fecha_exp: string;
    fecha_requ: string;
    fecha_resp: string;
    hecho: string;
    id_request: string;
    intentos: string;
    paso: string;
    tipo_documento: string;
    archivo_evidencia?: string;
    archivo_respuesta?: string;
    respuesta?: any;
  }
  
  export interface AdminProfile extends UserProfile {
    approved: boolean;
    blocked: boolean;
    city: string;
    createdAt: number;
    docType: string;
    firstName: string;
    lastName: string;
    mobile: string;
    pushToken: string;
    referralId: string;
    reviewed: boolean;
    securityData: SecurityData[];
    signupViaReferral: string;
    term: boolean;
    updateAt: number;
    userPlatform: string;
    verifyId: string;
    verifyIdImage: string;
    walletBalance: number;
  }  
  