"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Info } from "lucide-react";

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Assistant IA CME</h1>
          <p className="text-sm text-muted-foreground">Votre expert en fiscalité immobilière</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bientôt disponible</CardTitle>
          <CardDescription>L'agent IA nécessite une clé Anthropic</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Pour activer l'assistant : installer <code className="font-mono">@anthropic-ai/sdk</code>, ajouter
              <code className="font-mono"> ANTHROPIC_API_KEY</code> dans <code className="font-mono">.env.local</code>,
              puis brancher la route <code className="font-mono">POST /api/agent/chat</code>.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
