
'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function DownloadCertificateButton() {
  const handleDownload = () => {
    // This will open the browser's print dialog.
    // The user can then choose to "Save as PDF".
    window.print();
  };

  return (
    <Button onClick={handleDownload}>
      <Download className="mr-2 h-4 w-4" />
      Download
    </Button>
  );
}
