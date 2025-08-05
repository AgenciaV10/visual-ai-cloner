import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestSuite } from "./TestSuite";
import { Play, Bug, CheckCircle, XCircle } from "lucide-react";

export function TestRunner() {
  const [showTests, setShowTests] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showTests ? (
        <Button
          onClick={() => setShowTests(true)}
          className="rounded-full w-12 h-12 shadow-lg gradient-bg"
          size="sm"
        >
          <Bug className="w-6 h-6" />
        </Button>
      ) : (
        <Card className="w-96 max-h-96 overflow-auto glass-effect">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Testes Automáticos</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTests(false)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TestSuite />
          </CardContent>
        </Card>
      )}
    </div>
  );
}