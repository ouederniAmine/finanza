// lib/services/category.service.ts
import { supabase, type Category } from '../supabase';

export class CategoryService {
	/**
	 * Get categories for a user filtered by type (income | expense)
	 * Includes both default categories and user-created ones.
	 */
	static async getUserCategories(
		userId: string,
		type: 'income' | 'expense'
	): Promise<Category[]> {
		const { data, error } = await supabase
			.from('categories')
			.select('*')
			.or(`user_id.eq.${userId},user_id.is.null,is_default.eq.true`)
			.eq('type', type)
			.order('is_default', { ascending: false })
			.order('name_tn', { ascending: true });

		if (error) throw error;
		return (data as Category[]) ?? [];
	}
}

