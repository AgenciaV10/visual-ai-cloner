import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Globe, Sparkles, Loader2 } from "lucide-react";

interface UrlInputProps {
  onClone: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onClone, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onClone(url.trim());
    }
  };

  return (
    <Card className="glass-effect glow-effect">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Globe className="w-6 h-6 text-primary" />
          <span>Clone qualquer site</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="url"
              placeholder="https://exemplo.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="cyber-border text-lg h-12"
              disabled={isLoading}
            />
            <Globe className="absolute right-3 top-3 w-6 h-6 text-muted-foreground" />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 text-lg gradient-bg glow-effect"
            disabled={!url.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Clonando site...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Clonar Site
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
            <Download className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">Clone Completo</h3>
              <p className="text-sm text-muted-foreground">HTML, CSS, JS e assets</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
            <Sparkles className="w-8 h-8 text-secondary" />
            <div>
              <h3 className="font-semibold">Editor Visual</h3>
              <p className="text-sm text-muted-foreground">Arrastar e soltar</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
            <Globe className="w-8 h-8 text-accent" />
            <div>
              <h3 className="font-semibold">IA Integrada</h3>
              <p className="text-sm text-muted-foreground">Edição por comando</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}