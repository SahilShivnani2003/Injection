export interface RegisterForm {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    gender: 'Male' | 'Female' | 'Other';
    age: number;
    address: string;
    pincode: string;
    role: 'user';
    city: string;     
    state: string;
    longitude: Number;
    latitude: Number;
}