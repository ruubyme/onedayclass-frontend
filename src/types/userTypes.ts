export interface User {
  id: number;
  role: string;
}

export interface UserInformationType {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  address: string;
  zonecode: string;
  address_detail?: string;
  role: string;
}
