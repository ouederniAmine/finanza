// lib/store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SupportedLanguage, isRTL, setRTLDirection } from './i18n';
import { Budget, Category, Debt, SavingsGoal, Transaction, User } from './supabase';

interface AuthState {
  user: User | null;
  session: any;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: any) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

interface FinancialState {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  debts: Debt[];
  categories: Category[];
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  userMonthlyIncome: number; // Monthly income from user preferences
  isLoading: boolean;
  
  // Actions
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  setSavingsGoals: (goals: SavingsGoal[]) => void;
  addSavingsGoal: (goal: SavingsGoal) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  
  setDebts: (debts: Debt[]) => void;
  addDebt: (debt: Debt) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  
  setCategories: (categories: Category[]) => void;
  setUserMonthlyIncome: (income: number) => void;
  setLoading: (loading: boolean) => void;
  
  // Computed values
  calculateTotals: () => void;
}

interface UIState {
  theme: 'light' | 'dark' | 'auto';
  language: SupportedLanguage;
  currency: 'TND' | 'USD' | 'EUR';
  rtl: boolean;
  
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: SupportedLanguage) => void;
  setCurrency: (currency: 'TND' | 'USD' | 'EUR') => void;
  setRtl: (rtl: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  immer((set, get) => ({
    user: null,
    session: null,
    isLoading: true,
    
    setUser: (user) => set((state) => {
      state.user = user;
    }),
    
    setSession: (session) => set((state) => {
      state.session = session;
    }),
    
    setLoading: (loading) => set((state) => {
      state.isLoading = loading;
    }),
    
    signOut: () => set((state) => {
      state.user = null;
      state.session = null;
    }),
  }))
);

export const useFinancialStore = create<FinancialState>()(
  immer((set, get) => ({
    transactions: [],
    budgets: [],
    savingsGoals: [],
    debts: [],
    categories: [],
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    userMonthlyIncome: 0,
    isLoading: false,
    
    setTransactions: (transactions) => set((state) => {
      state.transactions = transactions;
      state.calculateTotals();
    }),
    
    addTransaction: (transaction) => set((state) => {
      state.transactions.push(transaction);
      state.calculateTotals();
    }),
    
    updateTransaction: (id, updatedTransaction) => set((state) => {
      const index = state.transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        state.transactions[index] = { ...state.transactions[index], ...updatedTransaction };
        state.calculateTotals();
      }
    }),
    
    deleteTransaction: (id) => set((state) => {
      state.transactions = state.transactions.filter(t => t.id !== id);
      state.calculateTotals();
    }),
    
    setBudgets: (budgets) => set((state) => {
      state.budgets = budgets;
    }),
    
    addBudget: (budget) => set((state) => {
      state.budgets.push(budget);
    }),
    
    updateBudget: (id, updatedBudget) => set((state) => {
      const index = state.budgets.findIndex(b => b.id === id);
      if (index !== -1) {
        state.budgets[index] = { ...state.budgets[index], ...updatedBudget };
      }
    }),
    
    deleteBudget: (id) => set((state) => {
      state.budgets = state.budgets.filter(b => b.id !== id);
    }),
    
    setSavingsGoals: (goals) => set((state) => {
      state.savingsGoals = goals;
    }),
    
    addSavingsGoal: (goal) => set((state) => {
      state.savingsGoals.push(goal);
    }),
    
    updateSavingsGoal: (id, updatedGoal) => set((state) => {
      const index = state.savingsGoals.findIndex(g => g.id === id);
      if (index !== -1) {
        state.savingsGoals[index] = { ...state.savingsGoals[index], ...updatedGoal };
      }
    }),
    
    deleteSavingsGoal: (id) => set((state) => {
      state.savingsGoals = state.savingsGoals.filter(g => g.id !== id);
    }),
    
    setDebts: (debts) => set((state) => {
      state.debts = debts;
    }),
    
    addDebt: (debt) => set((state) => {
      state.debts.push(debt);
    }),
    
    updateDebt: (id, updatedDebt) => set((state) => {
      const index = state.debts.findIndex(d => d.id === id);
      if (index !== -1) {
        state.debts[index] = { ...state.debts[index], ...updatedDebt };
      }
    }),
    
    deleteDebt: (id) => set((state) => {
      state.debts = state.debts.filter(d => d.id !== id);
    }),
    
    setCategories: (categories) => set((state) => {
      state.categories = categories;
    }),
    
    setUserMonthlyIncome: (income) => set((state) => {
      state.userMonthlyIncome = income;
      state.calculateTotals(); // Recalculate totals when monthly income changes
    }),
    
    setLoading: (loading) => set((state) => {
      state.isLoading = loading;
    }),
    
    calculateTotals: () => set((state) => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const currentMonthTransactions = state.transactions.filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      });
      
      state.monthlyIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      state.monthlyExpenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      state.totalBalance = state.userMonthlyIncome + state.transactions
        .reduce((sum, t) => {
          return t.type === 'income' ? sum + t.amount : sum - t.amount;
        }, 0);
    }),
  }))
);

export const useUIStore = create<UIState>()(
  immer((set) => ({
    theme: 'auto',
    language: 'tn',
    currency: 'TND',
    rtl: false,
    
    setTheme: (theme) => set((state) => {
      state.theme = theme;
    }),
    
    setLanguage: (language) => set((state) => {
      state.language = language;
      state.rtl = isRTL(language);
      // Set RTL direction for the app
      setRTLDirection(language);
    }),
    
    setCurrency: (currency) => set((state) => {
      state.currency = currency;
    }),
    
    setRtl: (rtl) => set((state) => {
      state.rtl = rtl;
    }),
  }))
);
