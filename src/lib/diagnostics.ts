/**
 * Database Diagnostics
 * Helper functions to test database connectivity and configuration
 */

import { supabase, isSupabaseConfigured } from './supabase';

export interface DiagnosticResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Run all diagnostic tests
 */
export async function runDiagnostics(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  // Test 1: Configuration
  results.push(await testConfiguration());

  // Test 2: Connection
  results.push(await testConnection());

  // Test 3: Tables
  results.push(await testTables());

  // Test 4: Permissions
  results.push(await testPermissions());

  return results;
}

/**
 * Test if Supabase is configured
 */
async function testConfiguration(): Promise<DiagnosticResult> {
  const configured = isSupabaseConfigured();
  
  return {
    test: 'Configuration',
    success: configured,
    message: configured 
      ? '✅ Supabase is configured' 
      : '❌ Supabase credentials missing',
    details: configured ? 'Credentials found in /utils/supabase/info.tsx' : 'Check /utils/supabase/info.tsx'
  };
}

/**
 * Test database connection
 */
async function testConnection(): Promise<DiagnosticResult> {
  try {
    const { error } = await supabase
      .from('news')
      .select('id')
      .limit(1);

    if (error) throw error;

    return {
      test: 'Connection',
      success: true,
      message: '✅ Database connection successful',
      details: 'Can query database'
    };
  } catch (error: any) {
    return {
      test: 'Connection',
      success: false,
      message: '❌ Database connection failed',
      details: error?.message || 'Unknown error'
    };
  }
}

/**
 * Test if required tables exist
 */
async function testTables(): Promise<DiagnosticResult> {
  const requiredTables = [
    'news',
    'highlights',
    'partners',
    'team_members',
    'blog_posts',
    'publications',
    'projects',
    'admin_users',
  ];

  const existingTables: string[] = [];
  const missingTables: string[] = [];

  for (const table of requiredTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error && error.code === 'PGRST204') {
        missingTables.push(table);
      } else {
        existingTables.push(table);
      }
    } catch (error) {
      missingTables.push(table);
    }
  }

  const allExist = missingTables.length === 0;

  return {
    test: 'Tables',
    success: allExist,
    message: allExist 
      ? '✅ All required tables exist'
      : `❌ Missing ${missingTables.length} table(s)`,
    details: {
      existing: existingTables,
      missing: missingTables,
      hint: missingTables.length > 0 
        ? 'Run /database_schema.sql in Supabase SQL Editor'
        : null
    }
  };
}

/**
 * Test insert permissions
 */
async function testPermissions(): Promise<DiagnosticResult> {
  try {
    // Try to insert a test record
    const testData = {
      title: '__DIAGNOSTIC_TEST__',
      content: 'This is a diagnostic test',
      date: new Date().toISOString().split('T')[0],
    };

    const { data, error: insertError } = await supabase
      .from('news')
      .insert([testData])
      .select()
      .single();

    if (insertError) throw insertError;

    // If insert succeeded, delete the test record
    if (data?.id) {
      await supabase
        .from('news')
        .delete()
        .eq('id', data.id);
    }

    return {
      test: 'Permissions',
      success: true,
      message: '✅ Insert/Delete permissions working',
      details: 'RLS policies are configured correctly'
    };
  } catch (error: any) {
    return {
      test: 'Permissions',
      success: false,
      message: '❌ Permission denied',
      details: {
        error: error?.message || 'Unknown error',
        hint: 'Check RLS policies in /database_rls_policies.sql',
        code: error?.code
      }
    };
  }
}

/**
 * Print diagnostic results to console
 */
export function printDiagnostics(results: DiagnosticResult[]) {
  console.log('\n═══════════════════════════════════════');
  console.log('🔍 DATABASE DIAGNOSTICS');
  console.log('═══════════════════════════════════════\n');

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.test}: ${result.message}`);
    if (result.details) {
      console.log('   Details:', result.details);
    }
    console.log('');
  });

  const allSuccess = results.every(r => r.success);
  
  if (allSuccess) {
    console.log('✅ All diagnostics passed! Database is ready.');
  } else {
    console.log('❌ Some diagnostics failed. Check details above.');
  }
  
  console.log('═══════════════════════════════════════\n');
}

/**
 * Test a specific CRUD operation
 */
export async function testCRUDOperation(
  table: string,
  testData: any
): Promise<DiagnosticResult> {
  try {
    // CREATE
    const { data: created, error: createError } = await supabase
      .from(table)
      .insert([testData])
      .select()
      .single();

    if (createError) throw new Error(`Create failed: ${createError.message}`);

    // READ
    const { data: read, error: readError } = await supabase
      .from(table)
      .select('*')
      .eq('id', created.id)
      .single();

    if (readError) throw new Error(`Read failed: ${readError.message}`);

    // UPDATE
    const updateData = { ...testData, title: testData.title + ' (Updated)' };
    const { error: updateError } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', created.id);

    if (updateError) throw new Error(`Update failed: ${updateError.message}`);

    // DELETE
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq('id', created.id);

    if (deleteError) throw new Error(`Delete failed: ${deleteError.message}`);

    return {
      test: `CRUD on ${table}`,
      success: true,
      message: `✅ All CRUD operations work on ${table}`,
      details: 'Create, Read, Update, Delete all successful'
    };
  } catch (error: any) {
    return {
      test: `CRUD on ${table}`,
      success: false,
      message: `❌ CRUD operations failed on ${table}`,
      details: error?.message || 'Unknown error'
    };
  }
}
