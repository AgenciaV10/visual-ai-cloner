import { useState } from "react";
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

interface VisualEditorProps {
  clonedSite: {
    url: string;
    html: string;
    assets: string[];
  };
}

export function VisualEditor({ clonedSite }: VisualEditorProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewMode, setPreviewMode] = useState<"visual" | "code">("visual");

  const getViewportClass = () => {
    switch (viewMode) {
      case "mobile": return "max-w-sm";
      case "tablet": return "max-w-2xl";
      default: return "max-w-full";
    }
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
              <Button variant="outline" size="sm" className="cyber-border">
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
                    <div 
                      className="border border-border rounded-lg p-4 bg-white text-black min-h-[500px]"
                      dangerouslySetInnerHTML={{ __html: clonedSite.html }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="code" className="mt-4">
              <Card className="glass-effect h-[600px]">
                <CardContent className="p-4 h-full">
                  <pre className="text-sm text-muted-foreground overflow-auto h-full">
                    <code>{clonedSite.html}</code>
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