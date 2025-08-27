# 🧩 Component Cheatsheet

> **Instant access to all UI components** - Copy-paste ready code for every component in the Finanza app.

## ⚡ **Quick Component Index**

| Component | Purpose | Import | Usage |
|-----------|---------|--------|-------|
| **[ThemedView](#themedview)** | Container with theme | `@/components/ThemedView` | Layout wrapper |
| **[ThemedText](#themedtext)** | Text with theme | `@/components/ThemedText` | All text content |
| **[Button](#button)** | Interactive button | `@/components/ui/Button` | Actions, forms |
| **[Input](#input)** | Form input | `@/components/ui/Input` | User input |
| **[Card](#card)** | Content container | `@/components/ui/Card` | Content blocks |
| **[Modal](#modal)** | Overlay dialog | `@/components/ui/Modal` | Dialogs, forms |

---

## 🎨 **Core Theme Components**

### **ThemedView**
```typescript
import { ThemedView } from '@/components/ThemedView';

// Basic container
<ThemedView className="flex-1 p-4">
  {children}
</ThemedView>

// With custom styling
<ThemedView 
  className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6"
  style={{ marginTop: 20 }}
>
  {children}
</ThemedView>

// Common patterns
<ThemedView className="flex-1">              {/* Full screen */}
<ThemedView className="flex-row items-center"> {/* Horizontal layout */}
<ThemedView className="justify-center items-center"> {/* Centered */}
```

### **ThemedText**
```typescript
import { ThemedText } from '@/components/ThemedText';

// Typography variants
<ThemedText type="title">Main Heading</ThemedText>
<ThemedText type="subtitle">Section Title</ThemedText>
<ThemedText type="default">Body text</ThemedText>
<ThemedText type="caption">Small text</ThemedText>

// With styling
<ThemedText className="text-center text-lg font-semibold">
  Styled Text
</ThemedText>

// With i18n
<ThemedText>{t('common.save')}</ThemedText>

// Common patterns
<ThemedText type="title" className="mb-4">     {/* Page title */}
<ThemedText className="text-gray-600">        {/* Muted text */}
<ThemedText className="text-red-500">         {/* Error text */}
<ThemedText className="text-green-600">       {/* Success text */}
```

---

## 🔘 **Interactive Components**

### **Button**
```typescript
import { Button } from '@/components/ui/Button';

// Variants
<Button variant="default">Default Button</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// With loading state
<Button disabled={loading}>
  {loading ? 'Saving...' : 'Save'}
</Button>

// With icon
<Button className="flex-row items-center gap-2">
  <Icon name="save" size={16} />
  <Text>Save</Text>
</Button>

// Common patterns
<Button onPress={() => router.push('/next-screen')}>
  Continue
</Button>

<Button 
  variant="destructive" 
  onPress={() => handleDelete()}
>
  {t('common.delete')}
</Button>
```

### **TouchableOpacity Patterns**
```typescript
import { TouchableOpacity } from 'react-native';

// Basic touchable
<TouchableOpacity 
  onPress={handlePress}
  className="bg-blue-500 p-4 rounded-lg"
>
  <Text className="text-white text-center">Tap Me</Text>
</TouchableOpacity>

// With haptic feedback
<TouchableOpacity 
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handlePress();
  }}
>
  {children}
</TouchableOpacity>

// Card-like touchable
<TouchableOpacity className="bg-white p-4 rounded-lg shadow-sm mb-3">
  <Text className="font-semibold">{title}</Text>
  <Text className="text-gray-600">{description}</Text>
</TouchableOpacity>
```

---

## 📝 **Form Components**

### **Input**
```typescript
import { Input } from '@/components/ui/Input';

// Basic input
<Input
  placeholder={t('auth.email_placeholder')}
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
/>

// With validation
<Input
  placeholder={t('auth.password')}
  value={password}
  onChangeText={setPassword}
  secureTextEntry={true}
  error={passwordError}
/>

// Number input
<Input
  placeholder="0.00"
  value={amount}
  onChangeText={setAmount}
  keyboardType="decimal-pad"
  className="text-right"
/>

// TextArea equivalent
<Input
  placeholder={t('transaction.description')}
  value={description}
  onChangeText={setDescription}
  multiline={true}
  numberOfLines={3}
  textAlignVertical="top"
/>
```

### **Form Patterns**
```typescript
// Complete form structure
<ThemedView className="gap-4">
  <Input
    placeholder={t('profile.name')}
    value={name}
    onChangeText={setName}
    error={errors.name}
  />
  
  <Input
    placeholder={t('profile.email')}
    value={email}
    onChangeText={setEmail}
    keyboardType="email-address"
    error={errors.email}
  />
  
  <Button 
    onPress={handleSubmit}
    disabled={!isValid || loading}
  >
    {loading ? t('common.saving') : t('common.save')}
  </Button>
</ThemedView>
```

---

## 🃏 **Layout Components**

### **Card**
```typescript
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

// Basic card
<Card className="mb-4">
  <CardHeader>
    <ThemedText type="subtitle">Card Title</ThemedText>
  </CardHeader>
  <CardContent>
    <ThemedText>Card content goes here</ThemedText>
  </CardContent>
</Card>

// Transaction card pattern
<Card className="mb-3">
  <CardContent className="flex-row items-center justify-between p-4">
    <ThemedView className="flex-row items-center gap-3">
      <ThemedView className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
        <Icon name="shopping-cart" size={20} color="#3b82f6" />
      </ThemedView>
      <ThemedView>
        <ThemedText className="font-semibold">{transaction.description}</ThemedText>
        <ThemedText className="text-gray-600 text-sm">{transaction.category}</ThemedText>
      </ThemedView>
    </ThemedView>
    <ThemedText className="font-semibold text-lg">
      {formatCurrency(transaction.amount)}
    </ThemedText>
  </CardContent>
</Card>
```

### **List Patterns**
```typescript
// FlatList with cards
<FlatList
  data={transactions}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <TransactionCard transaction={item} />
  )}
  contentContainerStyle={{ padding: 16 }}
  showsVerticalScrollIndicator={false}
/>

// ScrollView with gap
<ScrollView 
  className="flex-1"
  contentContainerStyle={{ padding: 16, gap: 12 }}
>
  {data.map((item) => (
    <ItemCard key={item.id} item={item} />
  ))}
</ScrollView>
```

---

## 🖼️ **Display Components**

### **Progress Indicators**
```typescript
// Progress bar
<ThemedView className="bg-gray-200 rounded-full h-2 overflow-hidden">
  <ThemedView 
    className="bg-blue-500 h-full"
    style={{ width: `${progress}%` }}
  />
</ThemedView>

// Circular progress (with react-native-svg)
<Svg width={60} height={60}>
  <Circle
    cx={30}
    cy={30}
    r={25}
    stroke="#e5e7eb"
    strokeWidth={5}
    fill="none"
  />
  <Circle
    cx={30}
    cy={30}
    r={25}
    stroke="#3b82f6"
    strokeWidth={5}
    fill="none"
    strokeDasharray={`${progress * 1.57} 157`}
    strokeLinecap="round"
    transform="rotate(-90 30 30)"
  />
</Svg>
```

### **Status Badges**
```typescript
// Status badge component
function StatusBadge({ status }: { status: 'success' | 'pending' | 'error' }) {
  const colors = {
    success: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };
  
  return (
    <ThemedView className={`px-2 py-1 rounded-full ${colors[status]}`}>
      <ThemedText className="text-xs font-medium">
        {t(`status.${status}`)}
      </ThemedText>
    </ThemedView>
  );
}
```

---

## 🔄 **Modal & Navigation**

### **Modal**
```typescript
import { Modal } from '@/components/ui/Modal';

// Basic modal
<Modal
  visible={showModal}
  onClose={() => setShowModal(false)}
  title={t('modal.title')}
>
  <ThemedText>{t('modal.content')}</ThemedText>
  
  <ThemedView className="flex-row gap-3 mt-6">
    <Button 
      variant="outline" 
      onPress={() => setShowModal(false)}
      className="flex-1"
    >
      {t('common.cancel')}
    </Button>
    <Button 
      onPress={handleConfirm}
      className="flex-1"
    >
      {t('common.confirm')}
    </Button>
  </ThemedView>
</Modal>

// Action sheet style
<Modal
  visible={showActionSheet}
  onClose={() => setShowActionSheet(false)}
  position="bottom"
>
  <ThemedView className="gap-2">
    <Button variant="ghost" onPress={handleOption1}>
      {t('action.option1')}
    </Button>
    <Button variant="ghost" onPress={handleOption2}>
      {t('action.option2')}
    </Button>
  </ThemedView>
</Modal>
```

### **Navigation Patterns**
```typescript
import { Link, router } from 'expo-router';

// Link component
<Link href="/profile" asChild>
  <TouchableOpacity className="p-4">
    <ThemedText>Go to Profile</ThemedText>
  </TouchableOpacity>
</Link>

// Programmatic navigation
router.push('/next-screen');
router.replace('/replace-screen');
router.back();

// With parameters
router.push({
  pathname: '/transaction/[id]',
  params: { id: transaction.id }
});
```

---

## 🎨 **Styling Patterns**

### **Common NativeWind Classes**
```css
/* Layout */
flex-1                    /* Take full available space */
flex-row                  /* Horizontal layout */
items-center              /* Center vertically */
justify-between           /* Space between items */
gap-4                     /* Space between children */

/* Spacing */
p-4                       /* Padding 16px */
m-2                       /* Margin 8px */
mb-4                      /* Margin bottom 16px */
px-6                      /* Horizontal padding 24px */

/* Colors */
bg-blue-500               /* Background blue */
text-white                /* White text */
text-gray-600             /* Gray text */
border-gray-200           /* Gray border */

/* Typography */
text-lg                   /* Large text */
font-semibold             /* Semi-bold weight */
text-center               /* Center align */

/* Borders & Shapes */
rounded-lg                /* Large border radius */
border                    /* Add border */
shadow-sm                 /* Small shadow */

/* Positioning */
absolute                  /* Absolute positioning */
top-4                     /* Top 16px */
right-4                   /* Right 16px */
```

### **Dark Mode Patterns**
```typescript
// Conditional dark mode classes
<ThemedView className="bg-white dark:bg-gray-900">
  <ThemedText className="text-gray-900 dark:text-white">
    Content
  </ThemedText>
</ThemedView>

// Using theme-aware components (recommended)
<ThemedView>  {/* Automatically handles dark mode */}
  <ThemedText>Content</ThemedText>
</ThemedView>
```

---

## 🔧 **Utility Patterns**

### **Loading States**
```typescript
// Loading indicator
import { ActivityIndicator } from 'react-native';

{loading ? (
  <ActivityIndicator size="large" color="#3b82f6" />
) : (
  <YourContent />
)}

// Loading button
<Button disabled={loading}>
  {loading ? (
    <ThemedView className="flex-row items-center gap-2">
      <ActivityIndicator size="small" color="white" />
      <ThemedText className="text-white">{t('common.loading')}</ThemedText>
    </ThemedView>
  ) : (
    t('common.save')
  )}
</Button>
```

### **Error Handling**
```typescript
// Error display
{error && (
  <ThemedView className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
    <ThemedText className="text-red-700">
      {error.message || t('common.error')}
    </ThemedText>
  </ThemedView>
)}

// Input with error
<Input
  value={value}
  onChangeText={setValue}
  error={errors.field}
  className={errors.field ? 'border-red-500' : 'border-gray-300'}
/>
```

### **Empty States**
```typescript
// Empty list state
{data.length === 0 ? (
  <ThemedView className="flex-1 justify-center items-center p-8">
    <Icon name="inbox" size={48} color="#9ca3af" />
    <ThemedText className="text-center mt-4 text-gray-600">
      {t('transactions.empty_state')}
    </ThemedText>
    <Button 
      onPress={() => router.push('/add-transaction')}
      className="mt-4"
    >
      {t('transactions.add_first')}
    </Button>
  </ThemedView>
) : (
  <YourList data={data} />
)}
```

---

## 📱 **Platform-Specific Patterns**

### **Safe Area**
```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function YourScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <ThemedView 
      className="flex-1"
      style={{ paddingTop: insets.top }}
    >
      {/* Content */}
    </ThemedView>
  );
}
```

### **KeyboardAvoidingView**
```typescript
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView 
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  className="flex-1"
>
  <YourForm />
</KeyboardAvoidingView>
```

---

**🎯 Pro Tips:**
- Use `ThemedView` and `ThemedText` for automatic dark mode support
- Always include `error` prop handling in form inputs
- Use `gap-*` classes instead of margins between items
- Test components in both light and dark mode
- Add loading states for better UX

**📚 Next**: Check out [Database Patterns](./database-patterns.md) for data handling patterns!
