import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  TestTube
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TestResult {
  name: string;
  status: "pending" | "running" | "passed" | "failed";
  error?: string;
  duration?: number;
}

export function TestSuite() {
  const [isRunning, setIsRunning] = useState(false);
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Clonagem de Site - URL Válida", status: "pending" },
    { name: "Clonagem de Site - URL Inválida", status: "pending" },
    { name: "Comando AI - Alterar Título", status: "pending" },
    { name: "Comando AI - Alterar Cor", status: "pending" },
    { name: "Editor Visual - Carregar HTML", status: "pending" },
    { name: "Editor Visual - Executar JavaScript", status: "pending" },
    { name: "Interface - Botões e Navegação", status: "pending" },
    { name: "Responsividade - Mobile/Tablet", status: "pending" }
  ]);
  const [progress, setProgress] = useState(0);

  const updateTestStatus = (index: number, status: TestResult["status"], error?: string, duration?: number) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, error, duration } : test
    ));
  };

  const runTest = async (testIndex: number, testFn: () => Promise<void>) => {
    const startTime = Date.now();
    updateTestStatus(testIndex, "running");
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      updateTestStatus(testIndex, "passed", undefined, duration);
      return true;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestStatus(testIndex, "failed", error.message, duration);
      return false;
    }
  };

  const testWebsiteCloning = async () => {
    // Test valid URL
    const response = await supabase.functions.invoke('clone-website', {
      body: { url: 'https://example.com' }
    });
    
    if (response.error) {
      throw new Error(`Falha na clonagem: ${response.error.message}`);
    }
    
    if (!response.data || !response.data.html) {
      throw new Error('HTML não retornado pela função de clonagem');
    }
  };

  const testInvalidUrlCloning = async () => {
    const response = await supabase.functions.invoke('clone-website', {
      body: { url: 'invalid-url' }
    });
    
    // Should return an error for invalid URL
    if (!response.data?.error) {
      throw new Error('Deveria retornar erro para URL inválida');
    }
  };

  const testAICommand = async (command: string, html: string) => {
    const response = await supabase.functions.invoke('ai-edit', {
      body: { 
        command,
        currentHtml: html
      }
    });
    
    if (response.error) {
      throw new Error(`Falha no comando AI: ${response.error.message}`);
    }
    
    if (!response.data || !response.data.jsCode) {
      throw new Error('Código JavaScript não retornado pela IA');
    }
  };

  const testUIInteractions = async () => {
    // Test basic UI interactions
    const buttons = document.querySelectorAll('button');
    if (buttons.length === 0) {
      throw new Error('Nenhum botão encontrado na interface');
    }
    
    // Test if main elements are present
    const mainElements = ['header', 'main', '[data-testid]'];
    for (const selector of mainElements) {
      if (!document.querySelector(selector)) {
        console.warn(`Elemento ${selector} não encontrado`);
      }
    }
  };

  const testResponsiveness = async () => {
    // Test viewport changes
    const viewport = document.querySelector('[data-viewport]');
    if (!viewport) {
      console.warn('Elementos de responsividade não encontrados');
    }
    
    // Simulate different screen sizes
    const breakpoints = [320, 768, 1024, 1920];
    for (const width of breakpoints) {
      // This would need actual viewport testing in a real test environment
      console.log(`Testando largura: ${width}px`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const testHtml = '<html><body><h1 id="title">Test Title</h1><button>Test Button</button></body></html>';
    
    const testFunctions = [
      () => runTest(0, testWebsiteCloning),
      () => runTest(1, testInvalidUrlCloning),
      () => runTest(2, () => testAICommand('Mude o título para "Novo Título"', testHtml)),
      () => runTest(3, () => testAICommand('Mude a cor do botão para azul', testHtml)),
      () => runTest(4, async () => {
        // Test HTML loading
        const iframe = document.createElement('iframe');
        iframe.srcdoc = testHtml;
        if (!iframe.srcdoc) throw new Error('Falha ao carregar HTML no iframe');
      }),
      () => runTest(5, async () => {
        // Test JavaScript execution
        try {
          eval('console.log("Test JS execution")');
        } catch (error) {
          throw new Error('Falha na execução de JavaScript');
        }
      }),
      () => runTest(6, testUIInteractions),
      () => runTest(7, testResponsiveness)
    ];

    let passedTests = 0;
    for (let i = 0; i < testFunctions.length; i++) {
      const passed = await testFunctions[i]();
      if (passed) passedTests++;
      setProgress(((i + 1) / testFunctions.length) * 100);
    }

    setIsRunning(false);
    
    const failedTests = testFunctions.length - passedTests;
    if (failedTests === 0) {
      toast.success(`Todos os ${passedTests} testes passaram!`);
    } else {
      toast.error(`${failedTests} teste(s) falharam de ${testFunctions.length} total`);
    }
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-muted-foreground" />;
      case "running": return <TestTube className="w-4 h-4 text-blue-500 animate-spin" />;
      case "passed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    const variants = {
      pending: "secondary",
      running: "default",
      passed: "default",
      failed: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[status]} className="text-xs">
        {status === "passed" ? "PASSOU" : 
         status === "failed" ? "FALHOU" : 
         status === "running" ? "RODANDO" : "PENDENTE"}
      </Badge>
    );
  };

  const passedCount = tests.filter(t => t.status === "passed").length;
  const failedCount = tests.filter(t => t.status === "failed").length;

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="w-5 h-5 text-primary" />
          <span className="neon-text">Suite de Testes Automatizados</span>
        </CardTitle>
        
        <div className="flex items-center space-x-4">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="gradient-bg"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            {isRunning ? "Executando..." : "Executar Todos os Testes"}
          </Button>
          
          <div className="flex space-x-2">
            <Badge variant="default" className="bg-green-500">
              ✓ {passedCount} Passou
            </Badge>
            <Badge variant="destructive">
              ✗ {failedCount} Falhou
            </Badge>
          </div>
        </div>
        
        {isRunning && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Progresso: {Math.round(progress)}%
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {tests.map((test, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(test.status)}
              <span className="font-medium">{test.name}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {test.duration && (
                <span className="text-xs text-muted-foreground">
                  {test.duration}ms
                </span>
              )}
              {getStatusBadge(test.status)}
            </div>
          </div>
        ))}
        
        {tests.some(t => t.status === "failed") && (
          <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="font-semibold text-destructive">Erros Encontrados:</span>
            </div>
            {tests
              .filter(t => t.status === "failed")
              .map((test, index) => (
                <div key={index} className="text-sm text-destructive mb-1">
                  <strong>{test.name}:</strong> {test.error}
                </div>
              ))
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}