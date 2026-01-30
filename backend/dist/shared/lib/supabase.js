"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LISTINGS_BUCKET = exports.supabase = void 0;
exports.getSupabaseImageUrl = getSupabaseImageUrl;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
}
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is set in backend env; it is not used here.');
}
exports.supabase = supabaseUrl && supabaseServiceRoleKey
    ? (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null;
exports.LISTINGS_BUCKET = 'locus-listings';
function getSupabaseImageUrl(filePath) {
    if (!exports.supabase)
        return null;
    const { data } = exports.supabase.storage.from(exports.LISTINGS_BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
}
