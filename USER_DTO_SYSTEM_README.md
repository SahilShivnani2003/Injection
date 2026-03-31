# User DTO System

A comprehensive Data Transfer Object (DTO) system for user-related operations in the Injection app. This system provides type-safe interfaces for all user operations including registration, authentication, profile management, and data validation.

## Overview

The User DTO system consists of multiple DTOs that handle different aspects of user management:

- **Registration DTOs** - For user account creation
- **Authentication DTOs** - For login operations
- **Profile DTOs** - For user data management
- **Validation Functions** - For client-side data validation

## Core DTOs

### 1. **RegisterUserDTO**
Used for user registration with all required fields.

```typescript
interface RegisterUserDTO extends CreateUserDTO {
  confirmPassword: string;  // For password confirmation
}
```

**Required Fields:**
- `name: string` - Full name
- `email: string` - Email address
- `password: string` - Account password
- `confirmPassword: string` - Password confirmation
- `phone: string` - 10-digit mobile number
- `gender: 'Male' | 'Female' | 'Other'` - Gender selection
- `age: number` - Age (1-120)
- `address: string` - Full address
- `pincode: string` - 6-digit pincode
- `role: 'user'` - Default role

### 2. **Login DTOs**

#### **LoginWithMobileDTO**
```typescript
interface LoginWithMobileDTO {
  phone: string;    // 10-digit mobile number
  otp: string;      // 6-digit OTP
}
```

#### **LoginWithEmailDTO**
```typescript
interface LoginWithEmailDTO {
  email: string;    // Email address
  password: string; // Account password
}
```

### 3. **Profile Management DTOs**

#### **UpdateUserDTO**
```typescript
interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  age?: number;
  address?: string;
  pincode?: string;
  profileImage?: string;
}
```

#### **ChangePasswordDTO**
```typescript
interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
```

### 4. **API Response DTOs**

#### **UserResponseDTO**
```typescript
interface UserResponseDTO extends IUser {
  token?: string;  // Optional JWT token
}
```

#### **AuthResponseDTO**
```typescript
interface AuthResponseDTO {
  user: UserResponseDTO;
  token: string;
  refreshToken?: string;
}
```

### 5. **Password Reset DTOs**

#### **ForgotPasswordDTO**
```typescript
interface ForgotPasswordDTO {
  email: string;  // Email for password reset
}
```

#### **ResetPasswordDTO**
```typescript
interface ResetPasswordDTO {
  token: string;        // Reset token from email
  newPassword: string;
  confirmPassword: string;
}
```

### 6. **Query/Filter DTOs**

#### **UserQueryDTO**
```typescript
interface UserQueryDTO {
  page?: number;        // Pagination page
  limit?: number;       // Items per page
  search?: string;      // Search term
  role?: 'user' | 'admin';
  isActive?: boolean;
  gender?: 'Male' | 'Female' | 'Other';
  ageMin?: number;
  ageMax?: number;
  pincode?: string;
}
```

#### **UserListResponseDTO**
```typescript
interface UserListResponseDTO {
  users: UserResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## Validation Functions

### **validateRegisterUserDTO**
Validates registration data with comprehensive error checking.

```typescript
const errors = validateRegisterUserDTO(registerData);
if (errors.length > 0) {
  // Handle validation errors
  console.log('Validation errors:', errors);
}
```

**Validation Rules:**
- Name: Required, non-empty
- Email: Required, valid format
- Phone: Required, exactly 10 digits
- Password: Required, minimum 6 characters
- Confirm Password: Must match password
- Gender: Required
- Age: Required, between 1-120
- Address: Required, non-empty
- Pincode: Required, exactly 6 digits

### **validateLoginWithEmailDTO**
Validates email login data.

```typescript
const errors = validateLoginWithEmailDTO(loginData);
// Returns: ['Email is required', 'Invalid email format', 'Password is required']
```

### **validateLoginWithMobileDTO**
Validates mobile OTP login data.

```typescript
const errors = validateLoginWithMobileDTO(loginData);
// Returns: ['Phone number is required', 'Phone number must be 10 digits', 'OTP is required', 'OTP must be 6 digits']
```

## Usage Examples

### **User Registration**
```typescript
import { RegisterUserDTO, validateRegisterUserDTO } from '../types/userDTO';

const handleRegistration = async (formData: RegisterUserDTO) => {
  // Validate data
  const errors = validateRegisterUserDTO(formData);
  if (errors.length > 0) {
    alert('Validation failed: ' + errors.join(', '));
    return;
  }

  try {
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...userData } = formData;

    const response = await api.post('/auth/register', userData);
    console.log('Registration successful:', response.data);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### **Email Login**
```typescript
import { LoginWithEmailDTO, validateLoginWithEmailDTO } from '../types/userDTO';

const handleEmailLogin = async (credentials: LoginWithEmailDTO) => {
  const errors = validateLoginWithEmailDTO(credentials);
  if (errors.length > 0) {
    alert('Login validation failed: ' + errors.join(', '));
    return;
  }

  try {
    const response = await api.post('/auth/login/email', credentials);
    // Handle successful login
  } catch (error) {
    // Handle login error
  }
};
```

### **Profile Update**
```typescript
import { UpdateUserDTO } from '../types/userDTO';

const handleProfileUpdate = async (updates: UpdateUserDTO) => {
  try {
    const response = await api.put('/user/profile', updates);
    console.log('Profile updated:', response.data);
  } catch (error) {
    console.error('Profile update failed:', error);
  }
};
```

### **Password Change**
```typescript
import { ChangePasswordDTO } from '../types/userDTO';

const handlePasswordChange = async (passwordData: ChangePasswordDTO) => {
  // Client-side validation
  if (passwordData.newPassword !== passwordData.confirmNewPassword) {
    alert('New passwords do not match');
    return;
  }

  if (passwordData.newPassword.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  try {
    await api.post('/user/change-password', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    alert('Password changed successfully');
  } catch (error) {
    alert('Password change failed');
  }
};
```

## Integration with Forms

### **React Hook Form Integration**
```typescript
import { useForm } from 'react-hook-form';
import { RegisterUserDTO } from '../types/userDTO';

const RegistrationForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterUserDTO>();

  const onSubmit = (data: RegisterUserDTO) => {
    const validationErrors = validateRegisterUserDTO(data);
    if (validationErrors.length > 0) {
      // Handle validation errors
      return;
    }
    // Proceed with registration
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Full Name" />
      <input {...register('email')} type="email" placeholder="Email" />
      <input {...register('phone')} placeholder="Phone" />
      {/* ... other fields */}
      <button type="submit">Register</button>
    </form>
  );
};
```

## API Integration

### **Registration Endpoint**
```typescript
// POST /api/auth/register
const registerUser = async (userData: CreateUserDTO): Promise<AuthResponseDTO> => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};
```

### **Login Endpoints**
```typescript
// POST /api/auth/login/mobile
const loginWithMobile = async (credentials: LoginWithMobileDTO): Promise<AuthResponseDTO> => {
  const response = await api.post('/auth/login/mobile', credentials);
  return response.data;
};

// POST /api/auth/login/email
const loginWithEmail = async (credentials: LoginWithEmailDTO): Promise<AuthResponseDTO> => {
  const response = await api.post('/auth/login/email', credentials);
  return response.data;
};
```

### **Profile Management**
```typescript
// GET /api/user/profile
const getUserProfile = async (): Promise<UserResponseDTO> => {
  const response = await api.get('/user/profile');
  return response.data;
};

// PUT /api/user/profile
const updateUserProfile = async (updates: UpdateUserDTO): Promise<UserResponseDTO> => {
  const response = await api.put('/user/profile', updates);
  return response.data;
};
```

## Error Handling

The DTO system includes comprehensive validation that returns specific error messages:

```typescript
const errors = validateRegisterUserDTO(formData);
if (errors.length > 0) {
  // Display errors to user
  errors.forEach(error => {
    console.log('Validation Error:', error);
  });
}
```

## Type Safety

All DTOs are fully typed with TypeScript, ensuring:

- Compile-time type checking
- IntelliSense support in IDEs
- Runtime validation with clear error messages
- Consistent API contracts

## Best Practices

1. **Always validate on client-side** before API calls
2. **Use specific DTOs** for different operations
3. **Handle validation errors gracefully** with user-friendly messages
4. **Keep DTOs separate** from domain models
5. **Version DTOs** when API changes are needed
6. **Document breaking changes** in DTO interfaces

This DTO system provides a robust, type-safe foundation for all user-related operations in your application! 🚀