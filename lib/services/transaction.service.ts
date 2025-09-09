// lib/services/transaction.service.ts
import { supabase, type Transaction } from '../supabase';

interface CreateTransactionInput {
	userId: string;
	categoryId?: string;
	type: 'income' | 'expense' | 'transfer';
	amount: number;
	description_tn?: string;
	description_en?: string;
	transactionDate: string; // ISO string
	currency?: 'TND' | 'USD' | 'EUR';
}

export class TransactionService {
	static async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
		const {
			userId,
			categoryId,
			type,
			amount,
			description_tn,
			description_en,
			transactionDate,
			currency = 'TND',
		} = input;

		const { data, error } = await supabase
			.from('transactions')
			.insert([
				{
					user_id: userId,
					category_id: categoryId ?? null,
					type,
					amount,
					currency,
					description_tn,
					description_en,
					transaction_date: transactionDate,
					recurring: false,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				},
			])
			.select('*')
			.single();

		if (error) throw error;
		return data as Transaction;
	}
}

