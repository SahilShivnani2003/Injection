import { CreateUserDTO, IUser } from './user';

// Registration DTO - used for user registration
export interface RegisterUserDTO extends CreateUserDTO {
  confirmPassword: string;
}

// Login DTOs
export interface LoginWithMobileDTO {
  phone: string;
  otp: string;
}

export interface LoginWithEmailDTO {
  email: string;
  password: string;
}

// User Profile Update DTO
export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  age?: number;
  address?: string;
  pincode?: string;
  profileImage?: string;
}

// Change Password DTO
export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// User Response DTO (what API returns)
export interface UserResponseDTO extends IUser {
  token?: string;
}

// Auth Response DTO
export interface AuthResponseDTO {
  user: UserResponseDTO;
  token: string;
  refreshToken?: string;
}

// Password Reset DTOs
export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// User Query/Filter DTOs
export interface UserQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
  gender?: 'Male' | 'Female' | 'Other';
  ageMin?: number;
  ageMax?: number;
  pincode?: string;
}

export interface UserListResponseDTO {
  users: UserResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Validation helper functions
export const validateRegisterUserDTO = (data: RegisterUserDTO): string[] => {
  const errors: string[] = [];

  if (!data.name?.trim()) errors.push('Name is required');
  if (!data.email?.trim()) errors.push('Email is required');
  if (!data.email?.includes('@')) errors.push('Invalid email format');
  if (!data.phone?.trim()) errors.push('Phone number is required');
  if (data.phone?.length !== 10) errors.push('Phone number must be 10 digits');
  if (!data.password) errors.push('Password is required');
  if (data.password.length < 6) errors.push('Password must be at least 6 characters');
  if (data.password !== data.confirmPassword) errors.push('Passwords do not match');
  if (!data.gender) errors.push('Gender is required');
  if (!data.age || data.age < 1 || data.age > 120) errors.push('Valid age is required (1-120)');
  if (!data.address?.trim()) errors.push('Address is required');
  if (!data.pincode?.trim()) errors.push('Pincode is required');
  if (data.pincode?.length !== 6) errors.push('Pincode must be 6 digits');

  return errors;
};

export const validateLoginWithEmailDTO = (data: LoginWithEmailDTO): string[] => {
  const errors: string[] = [];

  if (!data.email?.trim()) errors.push('Email is required');
  if (!data.email?.includes('@')) errors.push('Invalid email format');
  if (!data.password) errors.push('Password is required');

  return errors;
};

export const validateLoginWithMobileDTO = (data: LoginWithMobileDTO): string[] => {
  const errors: string[] = [];

  if (!data.phone?.trim()) errors.push('Phone number is required');
  if (data.phone?.length !== 10) errors.push('Phone number must be 10 digits');
  if (!data.otp?.trim()) errors.push('OTP is required');
  if (data.otp?.length !== 6) errors.push('OTP must be 6 digits');

  return errors;
};