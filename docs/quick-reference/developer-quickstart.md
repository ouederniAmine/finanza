# 🚀 Developer Quickstart

> **Get from zero to coding in 5 minutes** - Everything you need to start developing Finanza features immediately.

## ⚡ **Instant Setup** (2 minutes)

### **1. Verify Prerequisites**
```bash
# Check versions (copy-paste this entire block)
node --version          # Should be 18+
npm --version          # Should be 9+
expo --version         # Should be latest
git --version          # Any recent version
```

### **2. Environment Check**
```bash
# Verify all environment variables are set
echo $EXPO_PUBLIC_SUPABASE_URL
echo $EXPO_PUBLIC_SUPABASE_ANON_KEY  
echo $EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

# Windows PowerShell:
echo $env:EXPO_PUBLIC_SUPABASE_URL
```

### **3. Quick Start**
```bash
# Start development (one command)
npm start

# Alternative: Start with clear cache
npm start --clear
```

---

## 🔥 **Essential Commands** (Copy-Paste Ready)

### **Development Commands**
```bash
# Start development server
npm start

# Start with specific platform
npm run android         # Android
npm run ios            # iOS  
npm run web            # Web browser

# Clear cache and restart
npm start --clear
npx expo start --clear

# Check for issues
npx expo doctor
```

### **Database Commands**
```bash
# Test Supabase connection
npx supabase status

# Check database tables
# (Use Supabase Dashboard → Table Editor)

# Run database migrations
# (Copy SQL from /docs/setup/database-setup.md)
```

### **Build Commands**
```bash
# Development build
npx expo run:android    # Android development
npx expo run:ios        # iOS development

# Production build (EAS)
npx eas build --platform android
npx eas build --platform ios
```

---

## 🎯 **Daily Development Workflow** (3 minutes)

### **Morning Routine**
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start development server
npm start

# 4. Verify app loads correctly
# Open http://localhost:19006 or scan QR code
```

### **Feature Development Loop**
```typescript
// 1. Create new feature branch
git checkout -b feature/your-feature-name

// 2. Start with component template (see /docs/templates/)
// 3. Follow component patterns (see /docs/quick-reference/component-cheatsheet.md)
// 4. Test your changes
// 5. Commit and push

git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

---

## 🧩 **Essential Code Patterns** (Copy-Paste Ready)

### **New Screen Template**
```typescript
// app/your-screen.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useI18n } from '@/hooks/useI18n';

export default function YourScreen() {
  const { t } = useI18n();

  return (
    <ThemedView className="flex-1 p-4">
      <ThemedText className="text-2xl font-bold mb-4">
        {t('your_screen.title')}
      </ThemedText>
      
      {/* Your content here */}
    </ThemedView>
  );
}
```

### **Database Query Pattern**
```typescript
// Common Supabase pattern
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';

export function useYourData() {
  const { user } = useUser();
  
  const fetchData = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  };
  
  return { fetchData };
}
```

### **Component with i18n Pattern**
```typescript
// components/YourComponent.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useI18n } from '@/hooks/useI18n';

interface YourComponentProps {
  title: string;
  onPress: () => void;
}

export function YourComponent({ title, onPress }: YourComponentProps) {
  const { t } = useI18n();
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-blue-500 p-4 rounded-lg"
    >
      <Text className="text-white font-semibold">
        {t('common.save')}
      </Text>
    </TouchableOpacity>
  );
}
```

---

## 📚 **Quick References** (Instant Access)

### **File Structure Quick Map**
```
app/                    → Screens (Expo Router)
  ├── (tabs)/          → Main navigation tabs
  ├── auth/            → Authentication screens
  ├── onboarding/      → User onboarding flow
  └── modals/          → Modal screens

components/            → Reusable UI components
  ├── ui/              → Basic UI components
  └── themed/          → Themed components

lib/                   → Utilities and services
  ├── supabase.ts      → Database client
  ├── clerk-supabase-sync.ts → Auth sync
  └── i18n.ts          → Internationalization

hooks/                 → Custom React hooks
constants/             → App constants and config
```

### **Essential Imports Quick Copy**
```typescript
// UI Components
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';

// Navigation
import { Link, router } from 'expo-router';
import { Stack } from 'expo-router';

// Authentication
import { useUser, useAuth } from '@clerk/clerk-expo';

// Database
import { supabase } from '@/lib/supabase';

// Internationalization
import { useI18n } from '@/hooks/useI18n';

// Utilities
import { cn } from '@/lib/utils';
```

### **Common NativeWind Classes**
```css
/* Layout */
flex-1 p-4 m-2 gap-4

/* Colors */
bg-blue-500 text-white bg-gray-100 text-gray-900

/* Typography */
text-lg font-semibold text-center

/* Spacing */
mb-4 mt-2 px-6 py-3

/* Borders */
rounded-lg border border-gray-200

/* Flex */
flex-row items-center justify-between
```

---

## 🔧 **Development Tools Quick Access**

### **VS Code Extensions (Essential)**
```json
// Copy this to VS Code extensions search
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "expo.vscode-expo-tools",
    "ms-vscode.vscode-react-native"
  ]
}
```

### **Debugging Quick Commands**
```bash
# View app logs
npx expo logs

# Clear Metro cache
npx expo start --clear

# Reset Expo CLI
npx expo install --fix

# Check for common issues
npx expo doctor
```

### **Database Quick Access**
```bash
# Open Supabase Dashboard
# https://supabase.com/dashboard

# Quick SQL to test connection
# SELECT current_user, now();

# Check user table
# SELECT * FROM users LIMIT 5;
```

---

## 🎯 **Common Tasks** (Step-by-Step)

### **Adding a New Translation**
```typescript
// 1. Add to lib/i18n/translations/tn.ts
export const tn = {
  your_screen: {
    title: "العنوان تاعك",
    description: "الوصف تاعك"
  }
};

// 2. Use in component
const { t } = useI18n();
<Text>{t('your_screen.title')}</Text>
```

### **Creating a New API Endpoint**
```typescript
// 1. Create function in lib/services/
export async function createYourData(data: YourDataType) {
  const { user } = useUser();
  if (!user) throw new Error('User not authenticated');
  
  return await supabase
    .from('your_table')
    .insert({ ...data, user_id: user.id });
}

// 2. Use in component with error handling
try {
  await createYourData(formData);
  router.push('/success');
} catch (error) {
  console.error('Error:', error);
}
```

### **Adding a New Screen**
```bash
# 1. Create file: app/your-screen.tsx
# 2. Use screen template (above)
# 3. Add navigation if needed
# 4. Add translations
# 5. Test on all platforms
```

---

## 🚨 **Emergency Fixes** (When Things Break)

### **App Won't Start**
```bash
# Try these in order:
1. npx expo start --clear
2. rm -rf node_modules && npm install
3. npx expo install --fix
4. Check environment variables
5. Restart Metro bundler
```

### **Database Connection Issues**
```bash
# Check these:
1. Verify SUPABASE_URL and SUPABASE_ANON_KEY
2. Check Supabase project status
3. Test connection in browser
4. Check network connectivity
```

### **Build Issues**
```bash
# Try these:
1. npx expo doctor
2. Check app.json configuration
3. Clear EAS build cache
4. Check native dependencies
```

---

## 📞 **Getting Help Fast**

### **Internal Resources** (< 1 minute)
- **[Component Library](./component-cheatsheet.md)** - UI component usage
- **[Database Patterns](./database-patterns.md)** - Common queries
- **[Troubleshooting](../troubleshooting/)** - Common issues
- **[Examples](../examples/)** - Working code samples

### **External Resources**
- **[Expo Docs](https://docs.expo.dev/)** - Platform documentation
- **[Clerk Docs](https://clerk.com/docs)** - Authentication
- **[Supabase Docs](https://supabase.com/docs)** - Database and APIs
- **[NativeWind Docs](https://www.nativewind.dev/)** - Styling

---

**🎯 Next Steps**: Check out the [Component Cheatsheet](./component-cheatsheet.md) and [Database Patterns](./database-patterns.md) for specific implementation patterns!
