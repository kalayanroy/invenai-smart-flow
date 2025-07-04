
-- Create purchase_returns table to track returned purchase items
CREATE TABLE public.purchase_returns (
  id text NOT NULL PRIMARY KEY,
  purchase_order_id text NOT NULL,
  purchase_item_id text NOT NULL,
  product_id text NOT NULL,
  product_name text NOT NULL,
  supplier text NOT NULL,
  original_quantity integer NOT NULL,
  return_quantity integer NOT NULL,
  unit_price text NOT NULL,
  total_refund text NOT NULL,
  return_date date NOT NULL DEFAULT CURRENT_DATE,
  reason text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'Pending',
  processed_by text,
  processed_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  company_id uuid REFERENCES public.companies(id)
);

-- Add RLS policies for purchase_returns
ALTER TABLE public.purchase_returns ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (can be refined based on user roles)
CREATE POLICY "Allow all operations on purchase_returns" ON public.purchase_returns
FOR ALL USING (true) WITH CHECK (true);

-- Users can access their company purchase returns
CREATE POLICY "Users can access their company purchase returns" ON public.purchase_returns
FOR ALL USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());

-- Create index for better query performance
CREATE INDEX idx_purchase_returns_purchase_order_id ON public.purchase_returns(purchase_order_id);
CREATE INDEX idx_purchase_returns_product_id ON public.purchase_returns(product_id);
