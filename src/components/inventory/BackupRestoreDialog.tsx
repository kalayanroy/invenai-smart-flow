
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload, Download, AlertTriangle } from 'lucide-react';
import { useBackupRestore } from '@/hooks/useBackupRestore';
import { Progress } from '@/components/ui/progress';

export const BackupRestoreDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { createBackup, restoreFromBackup, isLoading } = useBackupRestore();

  const handleBackup = async () => {
    try {
      await createBackup();
    } catch (error) {
      console.error('Backup failed:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) return;
    
    try {
      await restoreFromBackup(selectedFile);
      setSelectedFile(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Restore failed:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Backup & Restore
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Database Backup & Restore</DialogTitle>
          <DialogDescription>
            Create a backup of your inventory data or restore from a previous backup.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {isLoading && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Processing...</div>
              <Progress value={50} className="w-full" />
            </div>
          )}

          {/* Backup Section */}
          <div className="space-y-3">
            <h4 className="font-medium">Create Backup</h4>
            <p className="text-sm text-muted-foreground">
              Download a complete backup of your inventory database.
            </p>
            <Button 
              onClick={handleBackup} 
              disabled={isLoading}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              Create Backup
            </Button>
          </div>

          <div className="border-t pt-6">
            {/* Restore Section */}
            <div className="space-y-3">
              <h4 className="font-medium">Restore from Backup</h4>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Warning:</strong> Restoring will replace all current data. 
                    Create a backup first if you want to preserve current data.
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isLoading}
                />
                
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <Button 
                onClick={handleRestore}
                disabled={!selectedFile || isLoading}
                variant="destructive"
                className="w-full gap-2"
              >
                <Upload className="h-4 w-4" />
                Restore Database
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
