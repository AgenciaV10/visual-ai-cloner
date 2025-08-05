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
  selectedElement?: Element | null;
  onElementSelect?: (element: Element | null) => void;
}

export function VisualEditor({ clonedSite, onExecuteCode, selectedElement, onElementSelect }: VisualEditorProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewMode, setPreviewMode] = useState<"visual" | "code">("visual");
  const [currentHtml, setCurrentHtml] = useState(clonedSite.html);
  const [internalSelectedElement, setInternalSelectedElement] = useState<Element | null>(null);
  const [isHoverMode, setIsHoverMode] = useState(false);
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
      console.log("Executando código JavaScript:", jsCode);
      
      if (iframeRef.current && iframeRef.current.contentWindow && iframeRef.current.contentDocument) {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument;
        const iframeWindow = iframe.contentWindow as any;
        
        // Add jQuery if not present for easier DOM manipulation
        if (!iframeWindow.jQuery) {
          const script = iframeDoc.createElement('script');
          script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
          script.onload = () => {
            executeJavaScriptInIframe(jsCode, iframeWindow, iframeDoc);
          };
          iframeDoc.head.appendChild(script);
        } else {
          executeJavaScriptInIframe(jsCode, iframeWindow, iframeDoc);
        }
      } else {
        console.warn("Iframe não disponível, executando no contexto principal");
        eval(jsCode);
        toast.success("Código executado com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao executar código:", error);
      toast.error(`Erro ao executar código: ${error.message}`);
    }
    
    if (onExecuteCode) {
      onExecuteCode(jsCode);
    }
  };

  const executeJavaScriptInIframe = (jsCode: string, iframeWindow: any, iframeDoc: Document) => {
    try {
      // Create a safer execution context
      const safeEval = new Function('document', 'window', '$', jsCode);
      safeEval.call(iframeWindow, iframeDoc, iframeWindow, iframeWindow.jQuery || iframeWindow.$);
      
      // Update current HTML after execution
      const updatedHtml = iframeDoc.documentElement.outerHTML;
      if (updatedHtml) {
        setCurrentHtml(updatedHtml);
      }
      
      toast.success("Código executado com sucesso!");
      console.log("JavaScript executado no iframe:", jsCode);
    } catch (error: any) {
      console.error("Erro ao executar no iframe:", error);
      toast.error(`Erro: ${error.message}`);
    }
  };

  const enableHoverMode = () => {
    setIsHoverMode(true);
    if (iframeRef.current && iframeRef.current.contentDocument) {
      const iframeDoc = iframeRef.current.contentDocument;
      addHoverListeners(iframeDoc);
    }
  };

  const disableHoverMode = () => {
    setIsHoverMode(false);
    setInternalSelectedElement(null);
    onElementSelect?.(null);
    if (iframeRef.current && iframeRef.current.contentDocument) {
      const iframeDoc = iframeRef.current.contentDocument;
      removeHoverListeners(iframeDoc);
    }
  };

  const addHoverListeners = (doc: Document) => {
    const style = doc.createElement('style');
    style.id = 'hover-select-styles';
    style.innerHTML = `
      .hover-highlight {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
        cursor: pointer !important;
      }
      .selected-element {
        outline: 3px solid #10b981 !important;
        outline-offset: 2px !important;
        position: relative !important;
      }
    `;
    doc.head.appendChild(style);

    const handleMouseOver = (e: Event) => {
      const target = e.target as Element;
      if (target && target !== doc.body && target !== doc.documentElement) {
        target.classList.add('hover-highlight');
      }
    };

    const handleMouseOut = (e: Event) => {
      const target = e.target as Element;
      if (target) {
        target.classList.remove('hover-highlight');
      }
    };

    const handleClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as Element;
      
      // Remove previous selection
      doc.querySelectorAll('.selected-element').forEach(el => {
        el.classList.remove('selected-element');
      });
      
      // Add selection to current element
      if (target && target !== doc.body && target !== doc.documentElement) {
        target.classList.add('selected-element');
        setInternalSelectedElement(target);
        onElementSelect?.(target);
        toast.success(`Elemento selecionado: ${target.tagName.toLowerCase()}`);
      }
    };

    // Add event listeners
    doc.addEventListener('mouseover', handleMouseOver);
    doc.addEventListener('mouseout', handleMouseOut);
    doc.addEventListener('click', handleClick);

    // Store listeners for removal
    (doc as any)._hoverListeners = { handleMouseOver, handleMouseOut, handleClick };
  };

  const removeHoverListeners = (doc: Document) => {
    // Remove styles
    const style = doc.getElementById('hover-select-styles');
    if (style) {
      style.remove();
    }

    // Remove all highlight classes
    doc.querySelectorAll('.hover-highlight, .selected-element').forEach(el => {
      el.classList.remove('hover-highlight', 'selected-element');
    });

    // Remove event listeners
    if ((doc as any)._hoverListeners) {
      const { handleMouseOver, handleMouseOut, handleClick } = (doc as any)._hoverListeners;
      doc.removeEventListener('mouseover', handleMouseOver);
      doc.removeEventListener('mouseout', handleMouseOut);
      doc.removeEventListener('click', handleClick);
      delete (doc as any)._hoverListeners;
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
              <Button 
                variant={isHoverMode ? "default" : "ghost"} 
                size="sm"
                onClick={isHoverMode ? disableHoverMode : enableHoverMode}
              >
                <Eye className="w-4 h-4 mr-2" />
                {isHoverMode ? "Sair Seleção" : "Selecionar"}
              </Button>
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
                      sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                      title="Website Preview"
                      onLoad={() => {
                        console.log("Iframe carregado");
                        if (isHoverMode && iframeRef.current?.contentDocument) {
                          addHoverListeners(iframeRef.current.contentDocument);
                        }
                      }}
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
          <PropertiesPanel 
            selectedElement={selectedElement || internalSelectedElement}
            onExecuteCode={executeCode}
          />
        </div>
      </div>
    </div>
  );
}