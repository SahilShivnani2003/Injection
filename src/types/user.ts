export interface IUser {
    id?: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    gender: 'Male' | 'Female' | 'Other';
    age: number;
    address: string;
    pincode: string;
    role?: 'user' | 'admin';
    isActive?: boolean;
    profileImage?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface CreateUserDTO {
    name: string;
    email: string;
    password: string;
    phone: string;
    gender: 'Male' | 'Female' | 'Other';
    age: number;
    address: string;
    pincode: string;
    role?: 'user'
}