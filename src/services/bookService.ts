import { supabase } from './supabaseClient';
import type { Database } from '../types/database';

type Book = Database['public']['Tables']['books']['Row'];
type BookInsert = Database['public']['Tables']['books']['Insert'];

export const bookService = {
  // Get all books with optional filters
  async getBooks(filters?: {
    language?: string;
    format?: string;
    tags?: string[];
    search?: string;
  }) {
    try {
      let query = supabase
        .from('books')
        .select(`
          *,
          creator:created_by(name, role)
        `);

      if (filters?.language && filters.language !== 'all') {
        query = query.eq('language', filters.language);
      }

      if (filters?.format && filters.format !== 'all') {
        query = query.eq('format', filters.format);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  // Get a single book by ID
  async getBook(id: string) {
    try {
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          creator:created_by(name, role)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  },

  // Create a new book (creators only)
  async createBook(book: BookInsert) {
    try {
      const { data, error } = await supabase
        .from('books')
        .insert(book)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  // Search books for AI recommendations
  async searchBooksForAI(query: string, userInterests?: string[]) {
    try {
      let searchQuery = supabase
        .from('books')
        .select('*');

      // Text search
      if (query) {
        searchQuery = searchQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`);
      }

      // Interest-based filtering
      if (userInterests && userInterests.length > 0) {
        searchQuery = searchQuery.overlaps('tags', userInterests);
      }

      const { data, error } = await searchQuery
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching books for AI:', error);
      return [];
    }
  },

  // Get books by tags (for recommendations)
  async getBooksByTags(tags: string[], limit = 5) {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .overlaps('tags', tags)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching books by tags:', error);
      return [];
    }
  }
};