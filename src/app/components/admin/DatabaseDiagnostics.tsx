/**
 * Database Diagnostics Component
 * Helps admin test and verify database connectivity
 */

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/badge';
import { runDiagnostics, printDiagnostics, DiagnosticResult } from '@/lib/diagnostics';
import { CheckCircle, XCircle, Activity, RefreshCw } from 'lucide-react';

export const DatabaseDiagnostics: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const diagnosticResults = await runDiagnostics();
      setResults(diagnosticResults);
      printDiagnostics(diagnosticResults);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const allSuccess = results.length > 0 && results.every(r => r.success);
  const hasFailures = results.some(r => !r.success);

  if (!isOpen) {
    return (
      <div className="mb-4">
        <Button
          onClick={() => {
            setIsOpen(true);
            runTests();
          }}
          variant="outline"
          size="sm"
        >
          <Activity className="w-4 h-4 mr-2" />
          Run Database Diagnostics
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/30">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Database Diagnostics
            </CardTitle>
            <CardDescription>
              Test database connectivity and configuration
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
          >
            ×
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Banner */}
        {results.length > 0 && (
          <Alert variant={allSuccess ? 'default' : 'destructive'}>
            {allSuccess ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>All Tests Passed!</AlertTitle>
                <AlertDescription>
                  Your database is configured correctly and all operations are working.
                </AlertDescription>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                <AlertTitle>Some Tests Failed</AlertTitle>
                <AlertDescription>
                  Please review the failed tests below and follow the suggested fixes.
                </AlertDescription>
              </>
            )}
          </Alert>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <Card key={index} className={result.success ? 'border-green-200' : 'border-red-200'}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium">{result.test}</span>
                    </div>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'Pass' : 'Fail'}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-700 mb-2">{result.message}</p>

                  {result.details && (
                    <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
                      <div className="font-mono">
                        {typeof result.details === 'string' ? (
                          <div>{result.details}</div>
                        ) : (
                          <pre className="whitespace-pre-wrap overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={runTests}
            disabled={isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {results.length > 0 ? 'Run Again' : 'Run Tests'}
              </>
            )}
          </Button>

          {hasFailures && (
            <Button
              onClick={() => {
                window.open('/TROUBLESHOOTING_DB_OPERATIONS.md', '_blank');
              }}
              variant="outline"
            >
              View Troubleshooting Guide
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
          <strong>Need help?</strong> Check the console for detailed logs. 
          If tests fail, see <code>/TROUBLESHOOTING_DB_OPERATIONS.md</code> for solutions.
        </div>
      </CardContent>
    </Card>
  );
};
