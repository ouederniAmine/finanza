# 📝 Code Snippets Library

> **Micro-patterns for instant productivity** - Small, reusable code blocks you can copy in seconds.

## ⚡ **Instant Copy-Paste Snippets**

### 🔧 **Supabase Operations**

**Basic Query:**
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

**Insert with User:**
```typescript
const { data, error } = await supabase
  .from('table_name')
  .insert({
    ...formData,
    user_id: user.id,
    created_at: new Date().toISOString()
  })
  .select()
  .single();
```

**Update with Validation:**
```typescript
const { data, error } = await supabase
  .from('table_name')
  .update({ ...updates, updated_at: new Date().toISOString() })
  .eq('id', id)
  .eq('user_id', user.id)
  .select()
  .single();
```

### 🎨 **UI Patterns**

**Loading State:**
```typescript
{loading ? (
  <ThemedView className="flex-1 justify-center items-center">
    <ActivityIndicator size="large" />
    <ThemedText className="mt-2">{t('common.loading')}</ThemedText>
  </ThemedView>
) : (
  // Content
)}
```

**Empty State:**
```typescript
{data.length === 0 ? (
  <ThemedView className="flex-1 justify-center items-center py-12">
    <ThemedText className="text-center text-gray-600 mb-4">
      {t('screen.empty_state')}
    </ThemedText>
    <Button onPress={handleAdd}>{t('screen.add_first')}</Button>
  </ThemedView>
) : (
  // Data display
)}
```

**Error Boundary:**
```typescript
{error && (
  <ThemedView className="bg-red-50 p-4 rounded-lg mb-4">
    <ThemedText className="text-red-700">{error}</ThemedText>
  </ThemedView>
)}
```

### 🪝 **React Hooks**

**useState with TypeScript:**
```typescript
const [data, setData] = useState<DataType[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**useEffect for Data Loading:**
```typescript
useEffect(() => {
  if (!user) return;
  
  const loadData = async () => {
    setLoading(true);
    try {
      const result = await YourService.getData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  loadData();
}, [user]);
```

### 🌍 **Internationalization**

**Add New Translation:**
```typescript
// In translations file
export const en = {
  feature_name: {
    title: "Feature Title",
    action: "Action Button"
  }
};

// In component
const { t } = useI18n();
<ThemedText>{t('feature_name.title')}</ThemedText>
```

**Format Numbers:**
```typescript
// Currency formatting
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND'
  }).format(amount);
```

### 📱 **Navigation**

**Navigate with Params:**
```typescript
import { router } from 'expo-router';

// Navigate to screen
router.push('/screen-name');

// Navigate with parameters
router.push({
  pathname: '/screen-name',
  params: { id: '123', name: 'value' }
});

// Go back
router.back();
```

**Tab Navigation:**
```typescript
// In (tabs) layout
export default function TabLayout() {
  const { t } = useI18n();
  
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: Colors.primary }}>
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <HomeIcon color={color} />
        }}
      />
    </Tabs>
  );
}
```

### 🎭 **Form Validation**

**Basic Validation:**
```typescript
const validateForm = (data: FormData) => {
  const errors: Record<string, string> = {};
  
  if (!data.name.trim()) errors.name = 'Name is required';
  if (!data.amount || data.amount <= 0) errors.amount = 'Amount must be positive';
  
  return { isValid: Object.keys(errors).length === 0, errors };
};
```

**Email Validation:**
```typescript
const isValidEmail = (email: string) => 
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
```

### 🎨 **Styling Patterns**

**Conditional Classes:**
```typescript
className={`
  p-4 rounded-lg border
  ${variant === 'primary' ? 'bg-blue-500 border-blue-500' : 'bg-gray-100'}
  ${disabled ? 'opacity-50' : ''}
  ${error ? 'border-red-500' : 'border-gray-300'}
`}
```

**Dark Mode Support:**
```typescript
className="bg-white dark:bg-gray-800 text-black dark:text-white"
```

### 📊 **Date & Time**

**Format Dates:**
```typescript
// Relative time
const getRelativeTime = (date: string) => {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

// Format for display
const formatDate = (date: string) => 
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
```

### 🔐 **Authentication**

**User Check:**
```typescript
import { useUser } from '@clerk/clerk-expo';

const { user, isLoaded } = useUser();

if (!isLoaded) return <LoadingScreen />;
if (!user) return <SignInScreen />;
```

**Protected Route:**
```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return <LoadingScreen />;
  if (!user) {
    router.replace('/auth/sign-in');
    return null;
  }
  
  return <>{children}</>;
};
```

### 📦 **State Management**

**Zustand Store:**
```typescript
import { create } from 'zustand';

interface StoreState {
  data: DataType[];
  loading: boolean;
  setData: (data: DataType[]) => void;
  addItem: (item: DataType) => void;
  removeItem: (id: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  data: [],
  loading: false,
  setData: (data) => set({ data }),
  addItem: (item) => set((state) => ({ data: [...state.data, item] })),
  removeItem: (id) => set((state) => ({ 
    data: state.data.filter(item => item.id !== id) 
  }))
}));
```

---

**🚀 Usage Tips:**
- **Copy exactly** - These snippets are tested and ready to use
- **Replace placeholders** - Update `table_name`, `DataType`, etc.
- **Add types** - Include proper TypeScript interfaces
- **Test immediately** - Verify snippets work in your context
