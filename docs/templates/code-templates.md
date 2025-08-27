# 📋 Code Templates

> **Ready-to-use code templates** - Copy, paste, and customize for faster development.

## ⚡ **Template Index**

| Template | Type | Use Case | Copy Time |
|----------|------|----------|-----------|
| **[Screen Template](#screen-template)** | Full Screen | New app screens | 30 seconds |
| **[Component Template](#component-template)** | React Component | Reusable UI components | 15 seconds |
| **[Service Template](#service-template)** | Data Service | Database operations | 20 seconds |
| **[Hook Template](#custom-hook-template)** | Custom Hook | Reusable logic | 15 seconds |
| **[Modal Template](#modal-template)** | Modal Dialog | User interactions | 25 seconds |
| **[Form Template](#form-template)** | Form Component | Data input | 30 seconds |

---

## 📱 **Screen Template**

### **Basic Screen Structure**
```typescript
// app/[screen-name].tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/hooks/useI18n';
import { useUser } from '@clerk/clerk-expo';

export default function ScreenNameScreen() {
  const { t } = useI18n();
  const { user } = useUser();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // TODO: Replace with actual data fetching
      const result = await YourService.getData();
      setData(result);
    } catch (error) {
      console.error('Error loading data:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAction = () => {
    // TODO: Implement primary action
    router.push('/next-screen');
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: t('screen_name.title'),
          headerShown: true,
          headerBackTitle: t('common.back')
        }} 
      />
      
      <ThemedView className="flex-1">
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Header Section */}
          <ThemedText type="title" className="mb-2">
            {t('screen_name.heading')}
          </ThemedText>
          
          <ThemedText className="text-gray-600 dark:text-gray-400 mb-6">
            {t('screen_name.description')}
          </ThemedText>

          {/* Content Section */}
          {loading ? (
            <ThemedView className="flex-1 justify-center items-center py-12">
              <ActivityIndicator size="large" />
              <ThemedText className="mt-4 text-gray-600">
                {t('common.loading')}
              </ThemedText>
            </ThemedView>
          ) : data.length === 0 ? (
            // Empty State
            <ThemedView className="flex-1 justify-center items-center py-12">
              <ThemedText className="text-center text-gray-600 mb-4">
                {t('screen_name.empty_state')}
              </ThemedText>
              <Button onPress={handleAction}>
                {t('screen_name.add_first')}
              </Button>
            </ThemedView>
          ) : (
            // Data Display
            <ThemedView className="gap-4">
              {data.map((item, index) => (
                <YourItemComponent key={item.id || index} item={item} />
              ))}
            </ThemedView>
          )}

          {/* Action Button */}
          {!loading && data.length > 0 && (
            <Button 
              onPress={handleAction}
              className="mt-6"
            >
              {t('screen_name.primary_action')}
            </Button>
          )}
        </ScrollView>
      </ThemedView>
    </>
  );
}

// TODO: Add translations to lib/i18n/translations/
/*
screen_name: {
  title: "Screen Title",
  heading: "Main Heading", 
  description: "Screen description",
  empty_state: "No items yet",
  add_first: "Add First Item",
  primary_action: "Primary Action"
}
*/
```

### **Screen with Tab Navigation**
```typescript
// app/(tabs)/tab-screen.tsx
import React from 'react';
import { ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useI18n } from '@/hooks/useI18n';

export default function TabScreen() {
  const { t } = useI18n();

  return (
    <ThemedView className="flex-1">
      <ScrollView className="flex-1 p-4">
        <ThemedText type="title" className="mb-4">
          {t('tab_screen.title')}
        </ThemedText>
        
        {/* Tab-specific content */}
      </ScrollView>
    </ThemedView>
  );
}
```

---

## 🧩 **Component Template**

### **Basic Component**
```typescript
// components/ComponentName.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useI18n } from '@/hooks/useI18n';

interface ComponentNameProps {
  title: string;
  description?: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'secondary' | 'danger';
}

export function ComponentName({ 
  title, 
  description, 
  onPress, 
  disabled = false,
  variant = 'default'
}: ComponentNameProps) {
  const { t } = useI18n();

  const variantStyles = {
    default: 'bg-blue-500 border-blue-500',
    secondary: 'bg-gray-500 border-gray-500', 
    danger: 'bg-red-500 border-red-500'
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      className={`
        p-4 rounded-lg border
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50' : ''}
      `}
      activeOpacity={0.7}
    >
      <ThemedView className="flex-row items-center justify-between">
        <ThemedView className="flex-1">
          <ThemedText className="font-semibold text-white">
            {title}
          </ThemedText>
          
          {description && (
            <ThemedText className="text-white/80 text-sm mt-1">
              {description}
            </ThemedText>
          )}
        </ThemedView>

        {/* Optional icon or additional content */}
        {onPress && !disabled && (
          <ThemedText className="text-white text-lg">
            →
          </ThemedText>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}
```

### **List Item Component**
```typescript
// components/ListItemName.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useI18n } from '@/hooks/useI18n';

interface ListItemData {
  id: string;
  title: string;
  subtitle?: string;
  amount?: number;
  date?: string;
  status?: 'active' | 'inactive' | 'pending';
}

interface ListItemNameProps {
  item: ListItemData;
  onPress: (item: ListItemData) => void;
  onLongPress?: (item: ListItemData) => void;
}

export function ListItemName({ item, onPress, onLongPress }: ListItemNameProps) {
  const { t } = useI18n();

  const statusColors = {
    active: 'text-green-600',
    inactive: 'text-gray-500',
    pending: 'text-yellow-600'
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress?.(item)}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-3 shadow-sm"
      activeOpacity={0.7}
    >
      <ThemedView className="flex-row items-center justify-between">
        <ThemedView className="flex-1">
          <ThemedText className="font-semibold text-lg">
            {item.title}
          </ThemedText>
          
          {item.subtitle && (
            <ThemedText className="text-gray-600 dark:text-gray-400 text-sm">
              {item.subtitle}
            </ThemedText>
          )}
          
          {item.date && (
            <ThemedText className="text-gray-500 text-xs mt-1">
              {new Date(item.date).toLocaleDateString()}
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView className="items-end">
          {item.amount && (
            <ThemedText className="font-bold text-lg">
              {item.amount.toFixed(2)} TND
            </ThemedText>
          )}
          
          {item.status && (
            <ThemedText className={`text-sm ${statusColors[item.status]}`}>
              {t(`status.${item.status}`)}
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}
```

---

## 🔧 **Service Template**

### **Complete Service Class**
```typescript
// lib/services/feature-name.service.ts
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';

export interface FeatureData {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  amount?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateFeatureData = Omit<FeatureData, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateFeatureData = Partial<CreateFeatureData>;

export class FeatureNameService {
  // Create new record
  static async create(data: CreateFeatureData): Promise<FeatureData> {
    const { user } = useUser();
    if (!user) throw new Error('User not authenticated');

    const { data: result, error } = await supabase
      .from('feature_table')
      .insert({
        ...data,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  // Get all records for user
  static async getAll(): Promise<FeatureData[]> {
    const { user } = useUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('feature_table')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get single record by ID
  static async getById(id: string): Promise<FeatureData | null> {
    const { user } = useUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('feature_table')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  // Update record
  static async update(id: string, updates: UpdateFeatureData): Promise<FeatureData> {
    const { user } = useUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('feature_table')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Soft delete (mark as inactive)
  static async delete(id: string): Promise<void> {
    const { user } = useUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('feature_table')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Hard delete (permanent removal)
  static async hardDelete(id: string): Promise<void> {
    const { user } = useUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('feature_table')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Bulk operations
  static async bulkCreate(items: CreateFeatureData[]): Promise<FeatureData[]> {
    const { user } = useUser();
    if (!user) throw new Error('User not authenticated');

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('feature_table')
      .insert(
        items.map(item => ({
          ...item,
          user_id: user.id,
          created_at: now,
          updated_at: now
        }))
      )
      .select();

    if (error) throw error;
    return data || [];
  }

  // Search functionality
  static async search(query: string): Promise<FeatureData[]> {
    const { user } = useUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('feature_table')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  }

  // Statistics/aggregation
  static async getStats(): Promise<{ total: number; active: number; total_amount: number }> {
    const { user } = useUser();
    if (!user) return { total: 0, active: 0, total_amount: 0 };

    const { data, error } = await supabase
      .rpc('get_feature_stats', { user_id: user.id });

    if (error) throw error;
    return data || { total: 0, active: 0, total_amount: 0 };
  }
}

// Example usage:
/*
// In your component:
const [features, setFeatures] = useState<FeatureData[]>([]);

useEffect(() => {
  const loadFeatures = async () => {
    try {
      const data = await FeatureNameService.getAll();
      setFeatures(data);
    } catch (error) {
      console.error('Error loading features:', error);
    }
  };
  
  loadFeatures();
}, []);

const handleCreate = async (formData: CreateFeatureData) => {
  try {
    const newFeature = await FeatureNameService.create(formData);
    setFeatures(prev => [newFeature, ...prev]);
  } catch (error) {
    console.error('Error creating feature:', error);
  }
};
*/
```

---

## 🪝 **Custom Hook Template**

### **Data Fetching Hook**
```typescript
// hooks/useFeatureName.ts
import { useState, useEffect } from 'react';
import { FeatureNameService, FeatureData } from '@/lib/services/feature-name.service';

interface UseFeatureNameReturn {
  data: FeatureData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: CreateFeatureData) => Promise<void>;
  update: (id: string, data: UpdateFeatureData) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useFeatureName(): UseFeatureNameReturn {
  const [data, setData] = useState<FeatureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await FeatureNameService.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const create = async (formData: CreateFeatureData) => {
    try {
      const newItem = await FeatureNameService.create(formData);
      setData(prev => [newItem, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
      throw err;
    }
  };

  const update = async (id: string, updates: UpdateFeatureData) => {
    try {
      const updatedItem = await FeatureNameService.update(id, updates);
      setData(prev => prev.map(item => item.id === id ? updatedItem : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      await FeatureNameService.delete(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create,
    update,
    remove
  };
}
```

### **Form Hook Template**
```typescript
// hooks/useFeatureForm.ts
import { useState } from 'react';

interface FeatureFormData {
  name: string;
  description: string;
  amount: string;
  category: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  amount?: string;
  category?: string;
}

interface UseFeatureFormReturn {
  formData: FeatureFormData;
  errors: FormErrors;
  isValid: boolean;
  isSubmitting: boolean;
  updateField: (field: keyof FeatureFormData, value: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  submitForm: (onSubmit: (data: FeatureFormData) => Promise<void>) => Promise<void>;
}

const initialFormData: FeatureFormData = {
  name: '',
  description: '',
  amount: '',
  category: ''
};

export function useFeatureForm(): UseFeatureFormReturn {
  const [formData, setFormData] = useState<FeatureFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof FeatureFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setIsSubmitting(false);
  };

  const submitForm = async (onSubmit: (data: FeatureFormData) => Promise<void>) => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      resetForm();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = Object.keys(errors).length === 0 && 
                  formData.name.trim() !== '' && 
                  formData.amount.trim() !== '' &&
                  formData.category.trim() !== '';

  return {
    formData,
    errors,
    isValid,
    isSubmitting,
    updateField,
    validateForm,
    resetForm,
    submitForm
  };
}
```

---

## 🪟 **Modal Template**

### **Full Modal Component**
```typescript
// components/FeatureModal.tsx
import React from 'react';
import { Modal, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/hooks/useI18n';
import { useFeatureForm } from '@/hooks/useFeatureForm';

interface FeatureModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  title: string;
  initialData?: any;
}

export function FeatureModal({ 
  visible, 
  onClose, 
  onSubmit, 
  title,
  initialData 
}: FeatureModalProps) {
  const { t } = useI18n();
  const {
    formData,
    errors,
    isValid,
    isSubmitting,
    updateField,
    submitForm,
    resetForm
  } = useFeatureForm();

  // Set initial data when modal opens
  React.useEffect(() => {
    if (visible && initialData) {
      // Populate form with initial data
      Object.keys(initialData).forEach(key => {
        updateField(key as any, initialData[key]);
      });
    } else if (!visible) {
      resetForm();
    }
  }, [visible, initialData]);

  const handleSubmit = async () => {
    await submitForm(async (data) => {
      await onSubmit(data);
      onClose();
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ThemedView className="flex-1 bg-white dark:bg-gray-900">
        {/* Header */}
        <ThemedView className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={handleClose}>
            <ThemedText className="text-blue-500 text-lg">
              {t('common.cancel')}
            </ThemedText>
          </TouchableOpacity>
          
          <ThemedText type="subtitle">
            {title}
          </ThemedText>
          
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            <ThemedText 
              className={`text-lg ${
                isValid && !isSubmitting ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              {isSubmitting ? t('common.saving') : t('common.save')}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Form Content */}
        <ScrollView className="flex-1 p-4">
          <ThemedView className="gap-4">
            <ThemedView>
              <ThemedText className="text-gray-700 dark:text-gray-300 mb-2">
                {t('form.name_label')}
              </ThemedText>
              <Input
                placeholder={t('form.name_placeholder')}
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                error={errors.name}
              />
            </ThemedView>

            <ThemedView>
              <ThemedText className="text-gray-700 dark:text-gray-300 mb-2">
                {t('form.description_label')}
              </ThemedText>
              <Input
                placeholder={t('form.description_placeholder')}
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                multiline
                numberOfLines={3}
                error={errors.description}
              />
            </ThemedView>

            <ThemedView>
              <ThemedText className="text-gray-700 dark:text-gray-300 mb-2">
                {t('form.amount_label')}
              </ThemedText>
              <Input
                placeholder="0.00"
                value={formData.amount}
                onChangeText={(value) => updateField('amount', value)}
                keyboardType="decimal-pad"
                error={errors.amount}
              />
            </ThemedView>

            {/* Additional form fields */}
          </ThemedView>
        </ScrollView>

        {/* Footer Buttons */}
        <ThemedView className="p-4 border-t border-gray-200 dark:border-gray-700">
          <ThemedView className="flex-row gap-3">
            <Button 
              variant="outline" 
              onPress={handleClose}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            
            <Button 
              onPress={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? t('common.saving') : t('common.save')}
            </Button>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

// Usage example:
/*
const [showModal, setShowModal] = useState(false);

<FeatureModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onSubmit={handleCreateFeature}
  title={t('feature.create_title')}
/>
*/
```

---

## 📝 **Form Template**

### **Complete Form Component**
```typescript
// components/FeatureForm.tsx
import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/hooks/useI18n';
import { useFeatureForm } from '@/hooks/useFeatureForm';

interface FeatureFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  submitButtonText?: string;
  isEditing?: boolean;
}

export function FeatureForm({ 
  onSubmit, 
  initialData, 
  submitButtonText,
  isEditing = false 
}: FeatureFormProps) {
  const { t } = useI18n();
  const {
    formData,
    errors,
    isValid,
    isSubmitting,
    updateField,
    submitForm
  } = useFeatureForm();

  // Populate form with initial data
  React.useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach(key => {
        updateField(key as any, initialData[key]);
      });
    }
  }, [initialData]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1">
        <ThemedView className="p-4 gap-6">
          {/* Form Title */}
          <ThemedText type="title">
            {isEditing ? t('form.edit_title') : t('form.create_title')}
          </ThemedText>

          {/* Form Fields */}
          <ThemedView className="gap-4">
            {/* Name Field */}
            <ThemedView>
              <ThemedText className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                {t('form.name_label')} *
              </ThemedText>
              <Input
                placeholder={t('form.name_placeholder')}
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                error={errors.name}
                autoCapitalize="words"
              />
              {errors.name && (
                <ThemedText className="text-red-500 text-sm mt-1">
                  {errors.name}
                </ThemedText>
              )}
            </ThemedView>

            {/* Description Field */}
            <ThemedView>
              <ThemedText className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                {t('form.description_label')}
              </ThemedText>
              <Input
                placeholder={t('form.description_placeholder')}
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                error={errors.description}
              />
              {errors.description && (
                <ThemedText className="text-red-500 text-sm mt-1">
                  {errors.description}
                </ThemedText>
              )}
            </ThemedView>

            {/* Amount Field */}
            <ThemedView>
              <ThemedText className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                {t('form.amount_label')} *
              </ThemedText>
              <Input
                placeholder="0.00"
                value={formData.amount}
                onChangeText={(value) => updateField('amount', value)}
                keyboardType="decimal-pad"
                error={errors.amount}
                className="text-right"
              />
              {errors.amount && (
                <ThemedText className="text-red-500 text-sm mt-1">
                  {errors.amount}
                </ThemedText>
              )}
            </ThemedView>

            {/* Category Field */}
            <ThemedView>
              <ThemedText className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                {t('form.category_label')} *
              </ThemedText>
              <Input
                placeholder={t('form.category_placeholder')}
                value={formData.category}
                onChangeText={(value) => updateField('category', value)}
                error={errors.category}
              />
              {errors.category && (
                <ThemedText className="text-red-500 text-sm mt-1">
                  {errors.category}
                </ThemedText>
              )}
            </ThemedView>
          </ThemedView>

          {/* Form Instructions */}
          <ThemedView className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <ThemedText className="text-blue-700 dark:text-blue-300 text-sm">
              {t('form.instructions')}
            </ThemedText>
          </ThemedView>

          {/* Submit Button */}
          <Button
            onPress={() => submitForm(onSubmit)}
            disabled={!isValid || isSubmitting}
            className="mt-4"
          >
            {isSubmitting 
              ? t('common.saving') 
              : submitButtonText || (isEditing ? t('common.update') : t('common.create'))
            }
          </Button>

          {/* Required Fields Note */}
          <ThemedText className="text-gray-500 text-sm text-center">
            * {t('form.required_fields')}
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Usage example:
/*
<FeatureForm
  onSubmit={handleCreateFeature}
  submitButtonText={t('feature.create_button')}
/>

<FeatureForm
  onSubmit={handleUpdateFeature}
  initialData={existingFeature}
  isEditing={true}
/>
*/
```

---

## 📋 **Translation Template**

### **Complete Translation Set**
```typescript
// lib/i18n/translations/[language].ts

// Tunisian Arabic (tn.ts)
export const tn = {
  // Screen/Feature specific
  feature_name: {
    title: "العنوان بالتونسي",
    heading: "راس الصفحة",
    description: "وصف الخاصية",
    empty_state: "ما عندكش حاجة هنا",
    add_first: "زيد الأول",
    primary_action: "العمل الأساسي",
    create_title: "اصنع جديد",
    edit_title: "بدل",
    loading_message: "قاعد يحمل...",
    error_message: "صار خطأ"
  },
  
  // Form labels
  form: {
    name_label: "الاسم",
    name_placeholder: "اكتب الاسم",
    description_label: "الوصف", 
    description_placeholder: "اكتب الوصف",
    amount_label: "المبلغ",
    category_label: "الفئة",
    category_placeholder: "اختار الفئة",
    instructions: "املأ كل الحقول المطلوبة",
    required_fields: "حقول مطلوبة",
    create_button: "اصنع",
    update_button: "حدث"
  },
  
  // Common actions
  common: {
    save: "احفظ",
    cancel: "الغي",
    delete: "امحي",
    edit: "بدل",
    create: "اصنع",
    update: "حدث",
    back: "ارجع",
    next: "التالي",
    loading: "قاعد يحمل...",
    saving: "قاعد يحفظ...",
    error: "صار خطأ",
    success: "نجح",
    confirm: "أكد",
    yes: "إي",
    no: "لا"
  },
  
  // Status messages
  status: {
    active: "نشط",
    inactive: "غير نشط", 
    pending: "في الانتظار",
    completed: "مكتمل",
    failed: "فشل"
  }
};

// English (en.ts)
export const en = {
  feature_name: {
    title: "Feature Title",
    heading: "Page Heading",
    description: "Feature description",
    empty_state: "No items yet",
    add_first: "Add First Item",
    primary_action: "Primary Action",
    create_title: "Create New",
    edit_title: "Edit",
    loading_message: "Loading...",
    error_message: "An error occurred"
  },
  
  form: {
    name_label: "Name",
    name_placeholder: "Enter name",
    description_label: "Description",
    description_placeholder: "Enter description", 
    amount_label: "Amount",
    category_label: "Category",
    category_placeholder: "Select category",
    instructions: "Fill in all required fields",
    required_fields: "Required fields",
    create_button: "Create",
    update_button: "Update"
  },
  
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    update: "Update",
    back: "Back",
    next: "Next",
    loading: "Loading...",
    saving: "Saving...",
    error: "Error",
    success: "Success",
    confirm: "Confirm",
    yes: "Yes",
    no: "No"
  },
  
  status: {
    active: "Active",
    inactive: "Inactive",
    pending: "Pending", 
    completed: "Completed",
    failed: "Failed"
  }
};

// French (fr.ts)
export const fr = {
  feature_name: {
    title: "Titre de la Fonctionnalité",
    heading: "En-tête de Page",
    description: "Description de la fonctionnalité",
    empty_state: "Aucun élément pour l'instant",
    add_first: "Ajouter le Premier",
    primary_action: "Action Principale",
    create_title: "Créer Nouveau",
    edit_title: "Modifier",
    loading_message: "Chargement...",
    error_message: "Une erreur s'est produite"
  },
  
  form: {
    name_label: "Nom",
    name_placeholder: "Entrer le nom",
    description_label: "Description",
    description_placeholder: "Entrer la description",
    amount_label: "Montant", 
    category_label: "Catégorie",
    category_placeholder: "Sélectionner la catégorie",
    instructions: "Remplir tous les champs requis",
    required_fields: "Champs requis",
    create_button: "Créer",
    update_button: "Mettre à jour"
  },
  
  common: {
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer", 
    update: "Mettre à jour",
    back: "Retour",
    next: "Suivant",
    loading: "Chargement...",
    saving: "Enregistrement...",
    error: "Erreur",
    success: "Succès",
    confirm: "Confirmer",
    yes: "Oui",
    no: "Non"
  },
  
  status: {
    active: "Actif",
    inactive: "Inactif",
    pending: "En attente",
    completed: "Terminé", 
    failed: "Échoué"
  }
};
```

---

**🎯 Template Usage Tips:**
1. **Copy templates completely** - Don't miss imports or interfaces
2. **Replace placeholders** - Search for `FeatureName`, `feature_name`, etc.
3. **Add translations** - Don't forget to add all language variants
4. **Test immediately** - Verify templates work before customizing
5. **Follow naming conventions** - Keep consistent with existing code

**📚 Next**: Check out [Code Snippets](../snippets/) for smaller reusable blocks!
