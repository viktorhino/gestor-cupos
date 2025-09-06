"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ClientDebug() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test 1: Check if we can connect to Supabase
      const { data: connectionTest, error: connectionError } = await supabase
        .from('clients')
        .select('count')
        .single();

      console.log('Connection test:', { connectionTest, connectionError });

      // Test 2: Try to fetch all clients
      const { data: clients, error: fetchError } = await supabase
        .from('clients')
        .select('*');

      console.log('Fetch clients:', { clients, fetchError });

      // Test 3: Check table structure
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_info', { table_name: 'clients' })
        .single();

      console.log('Table info:', { tableInfo, tableError });

      setResult({
        connectionTest: { data: connectionTest, error: connectionError },
        fetchTest: { data: clients, error: fetchError },
        tableInfo: { data: tableInfo, error: tableError }
      });

    } catch (error) {
      console.error('Debug error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const createTestClient = async () => {
    setLoading(true);
    try {
      const testClient = {
        nombre: 'Test Cliente',
        apellido: 'Test Apellido',
        whatsapp: '3001234567',
        email: 'test@test.com'
      };

      const { data, error } = await supabase
        .from('clients')
        .insert([testClient])
        .select()
        .single();

      console.log('Create test client:', { data, error });
      setResult({ createTest: { data, error } });

    } catch (error) {
      console.error('Create error:', error);
      setResult({ createError: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Debug Clientes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testConnection} disabled={loading}>
            Test Conexión
          </Button>
          <Button onClick={createTestClient} disabled={loading}>
            Crear Cliente Test
          </Button>
        </div>

        {result && (
          <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}