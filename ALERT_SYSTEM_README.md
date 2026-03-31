# Custom Alert System

A beautiful, customizable alert system for React Native with TypeScript support.

## Features

- 🎨 Beautiful gradient-based design matching your app theme
- 📱 Multiple alert types: success, error, info, warning, confirm
- 🎯 Auto-dismiss with customizable duration
- ⚡ Smooth animations (slide in/out)
- 🔄 Global state management with React Context
- 📝 TypeScript support with full type safety
- 🎭 Customizable confirm dialogs with callbacks

## Usage

### Basic Usage

```typescript
import { useAlert } from '../context/AlertContext';

const MyComponent = () => {
  const alert = useAlert();

  const handleSuccess = () => {
    alert.success('Success!', 'Operation completed successfully');
  };

  const handleError = () => {
    alert.error('Error!', 'Something went wrong');
  };

  const handleInfo = () => {
    alert.info('Info', 'This is an informational message');
  };

  const handleWarning = () => {
    alert.warning('Warning', 'Please be careful');
  };

  const handleConfirm = () => {
    alert.confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed?',
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm: () => {
        // Handle confirm action
        alert.success('Confirmed', 'Action completed');
      },
      onCancel: () => {
        // Handle cancel action
        alert.info('Cancelled', 'Action was cancelled');
      },
    });
  };

  const handleCustom = () => {
    alert.show({
      type: 'info',
      title: 'Custom Alert',
      message: 'This is a custom alert with all options',
      duration: 5000, // 5 seconds
    });
  };

  return (
    <View>
      <TouchableOpacity onPress={handleSuccess}>
        <Text>Show Success</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleError}>
        <Text>Show Error</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleInfo}>
        <Text>Show Info</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleWarning}>
        <Text>Show Warning</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleConfirm}>
        <Text>Show Confirm</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleCustom}>
        <Text>Show Custom</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Alert Types

- **`alert.success(title, message, duration?)`** - Green gradient with checkmark
- **`alert.error(title, message, duration?)`** - Red gradient with X mark
- **`alert.info(title, message, duration?)`** - Blue gradient with info icon
- **`alert.warning(title, message, duration?)`** - Orange gradient with warning icon
- **`alert.confirm(config)`** - Blue gradient with question mark and confirm/cancel buttons
- **`alert.show(config)`** - Custom alert with full configuration

### Alert Configuration

```typescript
interface AlertConfig {
  type: 'success' | 'error' | 'info' | 'warning' | 'confirm';
  title: string;
  message: string;
  duration?: number; // Auto-dismiss duration in ms (default: 4000, 0 = no auto-dismiss)
  onConfirm?: () => void; // Confirm callback (for confirm type only)
  onCancel?: () => void; // Cancel callback (for confirm type only)
  confirmText?: string; // Confirm button text (default: 'Confirm')
  cancelText?: string; // Cancel button text (default: 'Cancel')
}
```

### Advanced Usage

```typescript
// Custom duration
alert.success('Success', 'This will disappear in 2 seconds', 2000);

// No auto-dismiss
alert.info('Important', 'This alert stays until manually dismissed', 0);

// Full custom config
alert.show({
  type: 'confirm',
  title: 'Delete Item',
  message: 'This action cannot be undone. Are you sure?',
  confirmText: 'Delete',
  cancelText: 'Keep',
  onConfirm: () => deleteItem(),
  onCancel: () => console.log('Delete cancelled'),
});
```

## Setup

The alert system is already integrated into your app via the `AlertProvider` in `App.tsx`. Just import and use the `useAlert` hook in any component.

## Styling

The alerts automatically use your app's color theme from `src/theme/colors.ts`. The design includes:

- Gradient backgrounds for each alert type
- Smooth slide-in/slide-out animations
- Shadow effects and rounded corners
- Responsive design for different screen sizes
- Proper touch targets and accessibility