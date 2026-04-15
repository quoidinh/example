-- Initial Schema for Switch Supply Product Intelligence Dashboard

-- Enable pgcrypto for UUIDs if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    unit_of_measure TEXT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    supplier_name TEXT NOT NULL,
    country_of_origin TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Price History Table
CREATE TABLE IF NOT EXISTS public.price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'AUD',
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Query History Table (Bonus)
CREATE TABLE IF NOT EXISTS public.query_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    confidence TEXT NOT NULL,
    sources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row-Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_history ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Authenticated users can read all)
CREATE POLICY "Authenticated users can read products" ON public.products
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read price history" ON public.price_history
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can read their own query history" ON public.query_history
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own query history" ON public.query_history
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 6. Seed Data (15 products)
INSERT INTO public.products (name, sku, category, unit_of_measure, unit_price, stock_quantity, supplier_name, country_of_origin)
VALUES
    ('Matcha Powder (Ceremonial Grade)', 'GRN-MAT-001', 'Tea & Powders', 'kg', 85.00, 12, 'Uji Greens Ltd', 'Japan'),
    ('Beetroot Powder (Organic)', 'VEG-BEE-002', 'Vegetable Powders', 'kg', 24.50, 45, 'Aussie Organics', 'Australia'),
    ('Spirulina Powder', 'SUP-SPI-003', 'Superfoods', 'kg', 32.00, 8, 'Blue Bio-Tech', 'China'),
    ('Turmeric Root Powder', 'SPI-TUR-004', 'Spices', 'kg', 18.20, 120, 'Kerala Spice Co', 'India'),
    ('Maca Root Powder', 'SUP-MAC-005', 'Superfoods', 'kg', 29.00, 30, 'Andean Heritage', 'Peru'),
    ('Chlorella Powder', 'SUP-CHL-006', 'Superfoods', 'kg', 36.50, 15, 'Ocean Harvest', 'Taiwan'),
    ('Acai Berry Powder', 'SUP-ACA-007', 'Superfoods', 'kg', 48.00, 5, 'Amazon Vitality', 'Brazil'),
    ('Goji Berry (Dried)', 'SUP-GOJ-008', 'Superfoods', 'kg', 22.00, 60, 'Ningxia Gold', 'China'),
    ('Cacao Powder (Raw)', 'BAK-CAC-009', 'Baking & Cocoa', 'kg', 19.50, 85, 'Ghana Cocoa Coop', 'Ghana'),
    ('Camu Camu Powder', 'SUP-CAM-010', 'Superfoods', 'kg', 55.00, 3, 'Amazon Vitality', 'Peru'),
    ('Ashwagandha Root Powder', 'HER-ASH-011', 'Herbal Extracts', 'kg', 26.00, 40, 'Vedic Herbs', 'India'),
    ('Monk Fruit Extract', 'SWE-MON-012', 'Sweeteners', 'kg', 120.00, 10, 'Guilin Naturals', 'China'),
    ('Yacon Syrup', 'SWE-YAC-013', 'Sweeteners', 'kg', 42.00, 20, 'Andean Heritage', 'Peru'),
    ('Kelp Powder', 'SUP-KEL-014', 'Superfoods', 'kg', 15.00, 150, 'Tasmanian Kelp', 'Australia'),
    ('Wheatgrass Powder', 'SUP-WHE-015', 'Superfoods', 'kg', 28.00, 25, 'Aussie Organics', 'Australia');

-- 7. Seed Price History (Last 3 months: April, March, February 2026)
-- Dynamic seed for price history
DO $$
DECLARE
    p_id UUID;
    base_price DECIMAL;
BEGIN
    FOR p_id, base_price IN SELECT id, unit_price FROM public.products LOOP
        -- April 2026
        INSERT INTO public.price_history (product_id, price, date_recorded)
        VALUES (p_id, base_price, '2026-04-01');
        
        -- March 2026
        INSERT INTO public.price_history (product_id, price, date_recorded)
        VALUES (p_id, base_price * 0.95, '2026-03-01');
        
        -- February 2026
        INSERT INTO public.price_history (product_id, price, date_recorded)
        VALUES (p_id, base_price * 1.05, '2026-02-01');
    END LOOP;
END $$;
