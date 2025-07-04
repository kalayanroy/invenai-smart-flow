export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          ai_recommendation: string | null
          barcode: string | null
          category: string
          company_id: string | null
          created_at: string | null
          id: string
          image: string | null
          name: string
          opening_stock: number
          price: string
          purchase_price: string
          reorder_point: number
          sell_price: string
          sku: string
          status: string
          stock: number
          unit: string
          updated_at: string | null
        }
        Insert: {
          ai_recommendation?: string | null
          barcode?: string | null
          category: string
          company_id?: string | null
          created_at?: string | null
          id: string
          image?: string | null
          name: string
          opening_stock?: number
          price: string
          purchase_price: string
          reorder_point?: number
          sell_price: string
          sku: string
          status?: string
          stock?: number
          unit?: string
          updated_at?: string | null
        }
        Update: {
          ai_recommendation?: string | null
          barcode?: string | null
          category?: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          name?: string
          opening_stock?: number
          price?: string
          purchase_price?: string
          reorder_point?: number
          sell_price?: string
          sku?: string
          status?: string
          stock?: number
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_returns: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          original_quantity: number
          processed_by: string | null
          processed_date: string | null
          product_id: string
          product_name: string
          purchase_item_id: string
          purchase_order_id: string
          reason: string
          return_date: string
          return_quantity: number
          status: string
          supplier: string
          total_refund: string
          unit_price: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id: string
          notes?: string | null
          original_quantity: number
          processed_by?: string | null
          processed_date?: string | null
          product_id: string
          product_name: string
          purchase_item_id: string
          purchase_order_id: string
          reason: string
          return_date?: string
          return_quantity: number
          status?: string
          supplier: string
          total_refund: string
          unit_price: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          original_quantity?: number
          processed_by?: string | null
          processed_date?: string | null
          product_id?: string
          product_name?: string
          purchase_item_id?: string
          purchase_order_id?: string
          reason?: string
          return_date?: string
          return_quantity?: number
          status?: string
          supplier?: string
          total_refund?: string
          unit_price?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_returns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_voucher_items: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          product_id: string
          product_name: string
          quantity: number
          supplier: string
          total_amount: number
          unit_price: number
          voucher_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          product_name: string
          quantity: number
          supplier: string
          total_amount: number
          unit_price: number
          voucher_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          supplier?: string
          total_amount?: number
          unit_price?: number
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_voucher_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_voucher_items_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "purchase_vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_vouchers: {
        Row: {
          company_id: string | null
          created_at: string | null
          date: string
          discount_amount: number | null
          final_amount: number
          id: string
          notes: string | null
          payment_method: string | null
          status: string
          supplier_name: string
          total_amount: number
          updated_at: string | null
          voucher_number: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          date: string
          discount_amount?: number | null
          final_amount?: number
          id: string
          notes?: string | null
          payment_method?: string | null
          status?: string
          supplier_name: string
          total_amount?: number
          updated_at?: string | null
          voucher_number: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          date?: string
          discount_amount?: number | null
          final_amount?: number
          id?: string
          notes?: string | null
          payment_method?: string | null
          status?: string
          supplier_name?: string
          total_amount?: number
          updated_at?: string | null
          voucher_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_vouchers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          company_id: string | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          product_id: string
          product_name: string
          purchase_order_id: string | null
          quantity: number
          status: string
          supplier: string
          total_amount: string
          unit_price: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          product_id: string
          product_name: string
          purchase_order_id?: string | null
          quantity: number
          status?: string
          supplier: string
          total_amount: string
          unit_price: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          product_id?: string
          product_name?: string
          purchase_order_id?: string | null
          quantity?: number
          status?: string
          supplier?: string
          total_amount?: string
          unit_price?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          company_id: string | null
          created_at: string | null
          customer_name: string | null
          date: string
          id: string
          notes: string | null
          product_id: string
          product_name: string
          quantity: number
          status: string
          total_amount: string
          unit_price: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          customer_name?: string | null
          date: string
          id: string
          notes?: string | null
          product_id: string
          product_name: string
          quantity: number
          status?: string
          total_amount: string
          unit_price: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          customer_name?: string | null
          date?: string
          id?: string
          notes?: string | null
          product_id?: string
          product_name?: string
          quantity?: number
          status?: string
          total_amount?: string
          unit_price?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_returns: {
        Row: {
          company_id: string | null
          created_at: string | null
          customer_name: string | null
          id: string
          notes: string | null
          original_quantity: number
          original_sale_id: string | null
          original_voucher_id: string | null
          original_voucher_item_id: string | null
          processed_by: string | null
          processed_date: string | null
          product_id: string
          product_name: string
          reason: string
          return_date: string
          return_quantity: number
          source_type: string | null
          status: string
          total_refund: string
          unit_price: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          customer_name?: string | null
          id: string
          notes?: string | null
          original_quantity: number
          original_sale_id?: string | null
          original_voucher_id?: string | null
          original_voucher_item_id?: string | null
          processed_by?: string | null
          processed_date?: string | null
          product_id: string
          product_name: string
          reason: string
          return_date: string
          return_quantity: number
          source_type?: string | null
          status?: string
          total_refund: string
          unit_price: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          customer_name?: string | null
          id?: string
          notes?: string | null
          original_quantity?: number
          original_sale_id?: string | null
          original_voucher_id?: string | null
          original_voucher_item_id?: string | null
          processed_by?: string | null
          processed_date?: string | null
          product_id?: string
          product_name?: string
          reason?: string
          return_date?: string
          return_quantity?: number
          source_type?: string | null
          status?: string
          total_refund?: string
          unit_price?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_returns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_returns_original_sale_id_fkey"
            columns: ["original_sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_returns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_voucher_items: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          product_id: string
          product_name: string
          quantity: number
          total_amount: number
          unit_price: number
          voucher_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          product_name: string
          quantity: number
          total_amount: number
          unit_price: number
          voucher_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          total_amount?: number
          unit_price?: number
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_voucher_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_voucher_items_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "sales_vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_vouchers: {
        Row: {
          company_id: string | null
          created_at: string | null
          customer_name: string | null
          date: string
          discount_amount: number | null
          final_amount: number
          id: string
          notes: string | null
          payment_method: string | null
          status: string
          total_amount: number
          updated_at: string | null
          voucher_number: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          customer_name?: string | null
          date: string
          discount_amount?: number | null
          final_amount?: number
          id: string
          notes?: string | null
          payment_method?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
          voucher_number: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          customer_name?: string | null
          date?: string
          discount_amount?: number | null
          final_amount?: number
          id?: string
          notes?: string | null
          payment_method?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
          voucher_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_vouchers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          permissions: string[] | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          permissions?: string[] | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          permissions?: string[] | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin_or_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_has_role: {
        Args: { required_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "super_admin" | "admin" | "manager" | "staff" | "guest"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["super_admin", "admin", "manager", "staff", "guest"],
    },
  },
} as const
