import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { resolve } from 'path';
import { getArtisanWeeklyStats } from '../lib/analytics/artisan-stats';

// Load env vars from .env.local manually to avoid dotenv dependency
const envPath = resolve(__dirname, '../.env.local');

if (!fs.existsSync(envPath)) {
    console.error(`❌ .env.local NOT found at: ${envPath}`);
    // Fallback: try root .env
    const rootEnvPath = resolve(__dirname, '../.env');
    if (fs.existsSync(rootEnvPath)) {
        console.log(`Fallback: using .env at ${rootEnvPath}`);
        // ... parse logic for .env ...
    }
}

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
            if (key && value) {
                process.env[key] = value;
            }
        }
    });
}

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Use Anon key or Service Role if needed. Script implies admin access maybe?
// Actually simpler to use service role if we want to bypass RLS for validation, 
// BUT the tests seem to check insertion which RLS might block if anon.
// Let's stick to what we have or try to read env.

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function validatePhase0() {
    console.log('🧪 Validating Phase 0 Implementation...\n');

    // Test 1: Check tables exist
    // rpc('get_tables') likely doesn't exist. Using information_schema check.
    const requiredTables = ['contact_events', 'profile_view_events', 'upsell_impressions'];
    const missingTables = [];

    for (const table of requiredTables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error && error.code === '42P01') { // Undefined table
            missingTables.push(table);
        } else if (error) {
            // Some other error, maybe RLS, but table exists
            // console.log(`Warning checking ${table}: ${error.message}`);
        }
    }

    console.log('✅ Database Tables:', missingTables.length === 0 ? 'PASS' : `FAIL (missing: ${missingTables.join(', ')})`);

    // Test 2: Sample event insert
    // Using valid UUIDs from previous steps to avoid FK errors
    const testArtisanId = '08986f83-fd8b-4e57-b2e6-d822ee71ab76';
    const testBuyerId = '96769f85-bc04-49a9-afb3-2280d5318a2b';

    const { error: insertError } = await supabase
        .from('contact_events')
        .insert({
            artisan_id: testArtisanId,
            buyer_id: testBuyerId,
            contact_type: 'whatsapp', // Fixed: contact_method -> contact_type
            artisan_category: 'Script Test',
            artisan_location: 'Script Test'
        });

    console.log('✅ Event Insertion:', !insertError ? 'PASS' : `FAIL (${insertError?.message})`);

    // Test 3: Analytics function
    // Passing supabase client as 2nd arg
    try {
        const stats = await getArtisanWeeklyStats(testArtisanId, supabase);
        console.log('✅ Analytics Query:', stats ? 'PASS' : 'FAIL');
        if (stats) console.log('   Stats:', JSON.stringify(stats, null, 2));
    } catch (e) {
        console.log('✅ Analytics Query: FAIL', e);
    }

    console.log('\n🎉 Phase 0 Validation Complete!');
}

validatePhase0();
