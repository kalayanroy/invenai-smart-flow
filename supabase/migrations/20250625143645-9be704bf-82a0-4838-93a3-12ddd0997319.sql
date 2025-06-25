
-- Create sales_vouchers table
CREATE TABLE IF NOT EXISTS public.sales_vouchers (
  id TEXT NOT NULL PRIMARY KEY,
  voucher_number TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'Cash',
  status TEXT NOT NULL DEFAULT 'Completed',
  notes TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company_id UUID REFERENCES public.companies(id)
);

-- Create sales_voucher_items table
CREATE TABLE IF NOT EXISTS public.sales_voucher_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_id TEXT NOT NULL REFERENCES public.sales_vouchers(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company_id UUID REFERENCES public.companies(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_voucher_items_voucher_id ON public.sales_voucher_items(voucher_id);
CREATE INDEX IF NOT EXISTS idx_sales_voucher_items_product_id ON public.sales_voucher_items(product_id);

-- Add trigger for updated_at column
DROP TRIGGER IF EXISTS update_sales_vouchers_updated_at ON public.sales_vouchers;
CREATE TRIGGER update_sales_vouchers_updated_at
  BEFORE UPDATE ON public.sales_vouchers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
