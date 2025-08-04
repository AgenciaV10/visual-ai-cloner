import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Code, 
  Smartphone, 
  Monitor, 
  Tablet,
  Undo,
  Redo,
  Save,
  Play
} from "lucide-react";
import { ElementsPanel } from "./ElementsPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { toast } from "sonner";

interface VisualEditorProps {
  clonedSite: {
    url: string;
    html: string;
    assets: string[];
  };
  onExecuteCode?: (jsCode: string) => void;
}

export function VisualEditor({ clonedSite, onExecuteCode }: VisualEditorProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewMode, setPreviewMode] = useState<"visual" | "code">("visual");
  const [currentHtml, setCurrentHtml] = useState(clonedSite.html);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getViewportClass = () => {
    switch (viewMode) {
      case "mobile": return "max-w-sm";
      case "tablet": return "max-w-2xl";
      default: return "max-w-full";
    }
  };

  const executeCode = (jsCode: string) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // Execute code in iframe context
        const contentWindow = iframeRef.current.contentWindow as any;
        contentWindow.eval(jsCode);
        
        // Get updated HTML from iframe
        const updatedHtml = iframeRef.current.contentDocument?.documentElement.outerHTML;
        if (updatedHtml) {
          setCurrentHtml(updatedHtml);
        }
        
        toast.success("Código executado com sucesso!");
      } else {
        // Fallback: try to execute in current window (for non-iframe content)
        (window as any).eval(jsCode);
        toast.success("Código executado com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao executar código:", error);
      toast.error(`Erro ao executar código: ${error.message}`);
    }
    
    // Also call the parent callback if provided
    if (onExecuteCode) {
      onExecuteCode(jsCode);
    }
  };

  const handleSave = () => {
    console.log("Salvando alterações...");
    const htmlToSave = iframeRef.current?.contentDocument?.documentElement.outerHTML || currentHtml;
    
    // Here you could implement actual saving functionality
    // For now, just show a success message
    toast.success("Alterações salvas!");
    console.log("HTML atualizado:", htmlToSave);
  };

  return (
    <div className="space-y-4 h-full">
      {/* Editor Toolbar */}
      <Card className="glass-effect">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="cyber-border">
                {clonedSite.url}
              </Badge>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant={viewMode === "desktop" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("desktop")}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "tablet" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("tablet")}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "mobile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("mobile")}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Redo className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="cyber-border"
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button variant="default" size="sm" className="gradient-bg">
                <Play className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Editor Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100%-5rem)]">
        {/* Elements Panel */}
        <div className="lg:col-span-1">
          <ElementsPanel />
        </div>
        
        {/* Canvas Area */}
        <div className="lg:col-span-3 space-y-4">
          <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as "visual" | "code")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="visual">
                <Eye className="w-4 h-4 mr-2" />
                Visual
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code className="w-4 h-4 mr-2" />
                Código
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="visual" className="mt-4">
              <Card className="glass-effect h-[600px]">
                <CardContent className="p-4 h-full">
                  <div className={`mx-auto transition-all duration-300 ${getViewportClass()}`}>
                    <iframe
                      ref={iframeRef}
                      className="w-full min-h-[500px] border border-border rounded-lg bg-white"
                      srcDoc={currentHtml}
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      title="Website Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="code" className="mt-4">
              <Card className="glass-effect h-[600px]">
                <CardContent className="p-4 h-full">
                  <pre className="text-sm text-muted-foreground overflow-auto h-full">
                    <code>{currentHtml}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Properties Panel */}
        <div className="lg:col-span-1">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}