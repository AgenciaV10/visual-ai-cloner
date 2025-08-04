import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Mic, 
  Send, 
  Loader2,
  Zap,
  MessageSquare,
  History
} from "lucide-react";
import { toast } from "sonner";

export function AiPanel() {
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setIsProcessing(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Comando executado com sucesso!");
      setCommand("");
    } catch (error) {
      toast.error("Erro ao processar comando");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast.info("Escutando... fale agora!");
    } else {
      toast.info("Gravação parada");
    }
  };

  const quickCommands = [
    "Mudar cor do título para azul",
    "Adicionar uma imagem no banner",
    "Trocar texto do botão principal",
    "Criar uma seção de contato"
  ];

  return (
    <Card className="glass-effect glow-effect h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="neon-text">IA Assistant</span>
        </CardTitle>
        <Badge variant="outline" className="cyber-border w-fit">
          <Zap className="w-3 h-3 mr-1" />
          Gemini 2.5 Pro
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Textarea
              placeholder="Descreva o que você quer mudar..."
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="min-h-[120px] cyber-border resize-none"
              disabled={isProcessing}
            />
            {isListening && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={isListening ? "destructive" : "outline"}
              size="sm"
              onClick={toggleListening}
              className="flex-1"
            >
              <Mic className="w-4 h-4 mr-2" />
              {isListening ? "Parar" : "Falar"}
            </Button>
            
            <Button
              type="submit"
              className="flex-1 gradient-bg"
              disabled={!command.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Executar
                </>
              )}
            </Button>
          </div>
        </form>
        
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Comandos Rápidos
          </h3>
          
          {quickCommands.map((cmd, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left h-auto p-3 hover:bg-muted/50"
              onClick={() => setCommand(cmd)}
            >
              <div className="text-sm text-muted-foreground">"{cmd}"</div>
            </Button>
          ))}
        </div>
        
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold flex items-center mb-3">
            <History className="w-4 h-4 mr-2" />
            Histórico
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="p-2 rounded bg-muted/50">
              ✅ Título alterado para "Bem-vindo"
            </div>
            <div className="p-2 rounded bg-muted/50">
              ✅ Imagem do banner atualizada
            </div>
            <div className="p-2 rounded bg-muted/50">
              ✅ Cor do botão alterada para azul
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}