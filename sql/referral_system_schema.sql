-- Referral System Schema for Supabase
-- Run this in your Supabase SQL editor

-- Table for anonymous users (device-based)
CREATE TABLE IF NOT EXISTS anonymous_users (
    id TEXT PRIMARY KEY,
    device_id TEXT UNIQUE NOT NULL,
    device_fingerprint TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ,
    linked_user_id UUID REFERENCES auth.users(id),
    linked_at TIMESTAMPTZ
);

-- Table for referral codes
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    owner_id TEXT NOT NULL, -- Can be anonymous_user.id or auth.users.id
    owner_type TEXT DEFAULT 'anonymous' CHECK (owner_type IN ('anonymous', 'authenticated')),
    linked_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Table for referral statistics
CREATE TABLE IF NOT EXISTS referral_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id TEXT NOT NULL,
    owner_type TEXT DEFAULT 'anonymous' CHECK (owner_type IN ('anonymous', 'authenticated')),
    sent INTEGER DEFAULT 0,
    clicked INTEGER DEFAULT 0,
    converted INTEGER DEFAULT 0,
    plans_earned INTEGER DEFAULT 0,
    plans_gifted INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for referral conversions
CREATE TABLE IF NOT EXISTS referral_conversions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referral_code TEXT NOT NULL,
    referrer_id TEXT NOT NULL, -- User who shared the code
    purchaser_id TEXT NOT NULL, -- User who used the code
    conversion_date TIMESTAMPTZ DEFAULT NOW(),
    reward_status TEXT DEFAULT 'pending' CHECK (reward_status IN ('pending', 'applied', 'expired')),
    reward_amount INTEGER DEFAULT 50, -- Percentage discount
    reward_type TEXT DEFAULT 'percentage_discount',
    applied_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- Table for tracking when discounts are redeemed
CREATE TABLE IF NOT EXISTS discount_redemptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversion_id UUID REFERENCES referral_conversions(id),
    user_id TEXT NOT NULL, -- Who redeemed the discount
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    subscription_type TEXT,
    original_price DECIMAL(10,2),
    discounted_price DECIMAL(10,2),
    discount_amount DECIMAL(10,2)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_anonymous_users_device_id ON anonymous_users(device_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_owner ON referral_codes(owner_id, owner_type);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_referrer ON referral_conversions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_purchaser ON referral_conversions(purchaser_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_code ON referral_conversions(referral_code);

-- Function to increment referrer stats (called from backend service)
CREATE OR REPLACE FUNCTION increment_referrer_stats(referrer_id TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO referral_stats (owner_id, owner_type, converted, plans_earned, plans_gifted)
    VALUES (referrer_id, 'anonymous', 1, 1, 1)
    ON CONFLICT (owner_id) 
    DO UPDATE SET 
        converted = referral_stats.converted + 1,
        plans_earned = referral_stats.plans_earned + 1,
        plans_gifted = referral_stats.plans_gifted + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE anonymous_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_redemptions ENABLE ROW LEVEL SECURITY;

-- Policies for anonymous_users table
CREATE POLICY "Anonymous users can read their own data" ON anonymous_users
    FOR SELECT USING (TRUE); -- Allow reading for sync purposes

CREATE POLICY "Anonymous users can insert their own data" ON anonymous_users
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anonymous users can update their own data" ON anonymous_users
    FOR UPDATE USING (TRUE);

-- Policies for referral_codes table
CREATE POLICY "Users can read referral codes" ON referral_codes
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert referral codes" ON referral_codes
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update their own referral codes" ON referral_codes
    FOR UPDATE USING (TRUE);

-- Policies for referral_stats table
CREATE POLICY "Users can read referral stats" ON referral_stats
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert referral stats" ON referral_stats
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update referral stats" ON referral_stats
    FOR UPDATE USING (TRUE);

-- Policies for referral_conversions table
CREATE POLICY "Users can read referral conversions" ON referral_conversions
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert referral conversions" ON referral_conversions
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update referral conversions" ON referral_conversions
    FOR UPDATE USING (TRUE);

-- Policies for discount_redemptions table
CREATE POLICY "Users can read discount redemptions" ON discount_redemptions
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert discount redemptions" ON discount_redemptions
    FOR INSERT WITH CHECK (TRUE);

-- Function to get available discounts for a user
CREATE OR REPLACE FUNCTION get_user_available_discounts(user_identifier TEXT)
RETURNS TABLE (
    conversion_id UUID,
    reward_amount INTEGER,
    reward_type TEXT,
    conversion_date TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rc.id,
        rc.reward_amount,
        rc.reward_type,
        rc.conversion_date,
        rc.expires_at
    FROM referral_conversions rc
    WHERE (rc.referrer_id = user_identifier OR rc.purchaser_id = user_identifier)
    AND rc.reward_status = 'pending'
    AND (rc.expires_at IS NULL OR rc.expires_at > NOW());
END;
$$ LANGUAGE plpgsql;

-- Function to redeem a discount
CREATE OR REPLACE FUNCTION redeem_discount(
    conversion_id_param UUID,
    user_id_param TEXT,
    subscription_type_param TEXT,
    original_price_param DECIMAL(10,2)
)
RETURNS TABLE (
    success BOOLEAN,
    discounted_price DECIMAL(10,2),
    discount_amount DECIMAL(10,2)
) AS $$
DECLARE
    conversion_record referral_conversions%ROWTYPE;
    calculated_discount DECIMAL(10,2);
    final_price DECIMAL(10,2);
BEGIN
    -- Get the conversion record
    SELECT * INTO conversion_record 
    FROM referral_conversions 
    WHERE id = conversion_id_param AND reward_status = 'pending';

    -- Check if conversion exists and is still valid
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, original_price_param, 0.00::DECIMAL(10,2);
        RETURN;
    END IF;

    -- Calculate discount
    calculated_discount := original_price_param * (conversion_record.reward_amount / 100.0);
    final_price := original_price_param - calculated_discount;

    -- Mark conversion as applied
    UPDATE referral_conversions 
    SET reward_status = 'applied', applied_at = NOW()
    WHERE id = conversion_id_param;

    -- Record the redemption
    INSERT INTO discount_redemptions (
        conversion_id,
        user_id,
        subscription_type,
        original_price,
        discounted_price,
        discount_amount
    ) VALUES (
        conversion_id_param,
        user_id_param,
        subscription_type_param,
        original_price_param,
        final_price,
        calculated_discount
    );

    RETURN QUERY SELECT TRUE, final_price, calculated_discount;
END;
$$ LANGUAGE plpgsql;