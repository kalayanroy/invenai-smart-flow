
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBackupRestore } from '@/hooks/useBackupRestore';
import { Download, Upload, Database, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const BackupRestore = () => {
  const { createBackup, restoreFromBackup, isProcessing } = useBackupRestore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      restoreFromBackup(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Backup & Restore</h1>
        <p className="text-muted-foreground">
          Backup your inventory data and restore from previous backups
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Create Backup
            </CardTitle>
            <CardDescription>
              Export all your inventory data to a downloadable JSON file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Your backup will include:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All products and inventory</li>
                <li>Sales records</li>
                <li>Purchase records</li>
                <li>Sales returns</li>
              </ul>
            </div>
            <Button onClick={createBackup} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Backup
            </Button>
          </CardContent>
        </Card>

        {/* Restore Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restore from Backup
            </CardTitle>
            <CardDescription>
              Upload a backup file to restore your inventory data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Restoring from a backup will replace all current data. 
                Make sure to create a backup of your current data first.
              </AlertDescription>
            </Alert>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isProcessing ? 'Restoring...' : 'Select Backup File'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Backup Format:</strong> JSON file with timestamp</p>
            <p><strong>File Size:</strong> Varies based on your data volume</p>
            <p><strong>Compatibility:</strong> Works with this version of the system</p>
            <p><strong>Recommendation:</strong> Create regular backups to prevent data loss</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
