'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ValidationFormProps {
  onValidate: (validated: boolean, reason?: string) => Promise<void>;
}

export function ValidationForm({ onValidate }: ValidationFormProps) {
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleValidate = async (validated: boolean) => {
    if (!validated && !reason.trim()) {
      alert('Veuillez fournir une raison pour le rejet');
      return;
    }

    setProcessing(true);
    try {
      await onValidate(validated, validated ? undefined : reason);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Raison du rejet (si applicable)
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Expliquer pourquoi le profil est rejeté..."
            rows={4}
          />
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => handleValidate(true)}
            disabled={processing}
            className="bg-green-600 hover:bg-green-700"
          >
            ✓ Valider
          </Button>
          <Button
            onClick={() => handleValidate(false)}
            disabled={!reason.trim() || processing}
            variant="destructive"
          >
            ✗ Rejeter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
