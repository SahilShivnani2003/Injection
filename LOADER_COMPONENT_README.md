# Loader Component

A comprehensive, animated loader component system for React Native with multiple loader types, sizes, and customization options that matches your app's design theme.

## Features

- 🎨 **8 Different Loader Types**: spinner, dots, pulse, bars, ring, bounce, wave, gradient
- 📏 **4 Size Variants**: small, medium, large, xlarge
- 🎨 **Theme Integration**: Uses your app's gradient colors and design system
- 🎭 **Customizable**: Colors, gradients, text, overlay modes
- ⚡ **Smooth Animations**: Native driver animations for optimal performance
- 📱 **Responsive**: Adapts to different screen sizes
- 🔄 **Overlay Mode**: Full-screen overlay with backdrop

## Loader Types

### 1. **Spinner** (Default)
A rotating gradient ring with a hole in the center.
```tsx
<Loader type="spinner" />
```

### 2. **Dots**
Three pulsing dots that scale up and down in sequence.
```tsx
<Loader type="dots" />
```

### 3. **Pulse**
A single dot that pulses and scales with opacity changes.
```tsx
<Loader type="pulse" />
```

### 4. **Bars**
Five vertical bars that scale up and down like an audio equalizer.
```tsx
<Loader type="bars" />
```

### 5. **Ring**
A rotating ring border with transparent top section.
```tsx
<Loader type="ring" />
```

### 6. **Bounce**
Three dots that bounce up and down in sequence.
```tsx
<Loader type="bounce" />
```

### 7. **Wave**
A horizontal wave that moves across the container.
```tsx
<Loader type="wave" />
```

### 8. **Gradient**
A shimmering gradient bar that moves horizontally.
```tsx
<Loader type="gradient" />
```

## Usage Examples

### Basic Usage

```tsx
import Loader from '../components/Loader';

// Default spinner loader
<Loader />

// Large dots loader
<Loader type="dots" size="large" />

// Custom color pulse loader
<Loader type="pulse" color="#FF4757" />
```

### With Text

```tsx
<Loader
  type="spinner"
  size="medium"
  text="Loading data..."
  textColor="#2C3E50"
/>
```

### Custom Gradient

```tsx
<Loader
  type="gradient"
  gradientColors={['#00D4A0', '#00B4E8', '#00C4C8']}
  size="large"
/>
```

### Overlay Mode

```tsx
<Loader
  type="bars"
  overlay={true}
  text="Please wait..."
  backgroundColor="rgba(0,0,0,0.7)"
/>
```

### In Components

```tsx
const MyComponent = () => {
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      {loading ? (
        <Loader
          type="dots"
          size="large"
          text="Fetching data..."
        />
      ) : (
        <Text>Data loaded!</Text>
      )}
    </View>
  );
};
```

## Props API

```typescript
interface LoaderProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring' | 'bounce' | 'wave' | 'gradient';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  color?: string;                    // Custom color (defaults to theme gradient)
  gradientColors?: string[];         // Custom gradient colors
  text?: string;                     // Loading text below loader
  textColor?: string;                // Text color
  backgroundColor?: string;          // Overlay background color
  overlay?: boolean;                 // Full-screen overlay mode
  style?: any;                       // Additional styles
}
```

## Size Specifications

- **small**: 24px
- **medium**: 36px (default)
- **large**: 48px
- **xlarge**: 64px

## Theme Integration

The loader automatically uses your app's color theme:

- **Default Colors**: Uses `Colors.gradientStart` for single-color loaders
- **Gradients**: Uses `[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]`
- **Text Color**: Uses `Colors.textMedium` for loading text

## Performance

- Uses `useNativeDriver: true` for optimal animation performance
- Animations are properly cleaned up to prevent memory leaks
- Efficient rendering with minimal re-renders

## Accessibility

- Supports screen readers with proper text labels
- Respects user's animation preferences
- Overlay mode includes proper backdrop handling

## Examples in Action

### Loading Button
```tsx
<TouchableOpacity
  style={[styles.button, loading && styles.buttonDisabled]}
  disabled={loading}
>
  {loading ? (
    <Loader type="spinner" size="small" color="#FFFFFF" />
  ) : (
    <Text style={styles.buttonText}>Submit</Text>
  )}
</TouchableOpacity>
```

### Full Page Loading
```tsx
{isLoading ? (
  <Loader
    type="bars"
    size="large"
    overlay={true}
    text="Loading your dashboard..."
    backgroundColor="rgba(0, 212, 160, 0.1)"
  />
) : (
  <DashboardContent />
)}
```

### Inline Loading
```tsx
<View style={styles.listItem}>
  <Text style={styles.itemText}>Item Name</Text>
  {itemLoading && (
    <Loader type="dots" size="small" />
  )}
</View>
```

## Customization Tips

### Match Your Brand
```tsx
<Loader
  type="spinner"
  gradientColors={['#YOUR_BRAND_COLOR_1', '#YOUR_BRAND_COLOR_2']}
  text="Loading..."
  textColor="#YOUR_TEXT_COLOR"
/>
```

### Error States
```tsx
<Loader
  type="pulse"
  color="#FF4757"
  text="Failed to load"
/>
```

### Success States
```tsx
<Loader
  type="bounce"
  color="#7ED321"
  text="Success!"
/>
```

The loader component is fully integrated and ready to use throughout your app! 🚀