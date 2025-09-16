// lib/services/category.service.ts
import { supabase, type Category } from '../supabase';
import { getSupabaseUserByClerkId } from '../clerk-supabase-sync';

export class CategoryService {
	/**
	 * Get categories for a user filtered by type (income | expense)
	 * Includes both default categories and user-created ones.
	 * @param clerkUserId - Clerk user ID that will be mapped to Supabase UUID
	 */
	static async getUserCategories(
		clerkUserId: string,
		type: 'income' | 'expense'
	): Promise<Category[]> {
		// First get the Supabase user by Clerk ID
		const supabaseUser = await getSupabaseUserByClerkId(clerkUserId);
		if (!supabaseUser) {
			throw new Error('User not found in Supabase. Please sign in again.');
		}

		const { data, error } = await supabase
			.from('categories')
			.select('*')
			.or(`user_id.eq.${supabaseUser.id},user_id.is.null,is_default.eq.true`)
			.eq('type', type)
			.order('is_default', { ascending: false })
			.order('name_tn', { ascending: true });

		if (error) throw error;
		return (data as Category[]) ?? [];
	}
}

