import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { UrlInput } from "@/components/clone/UrlInput";
import { VisualEditor } from "@/components/editor/VisualEditor";
import { AiPanel } from "@/components/ai/AiPanel";
import { toast } from "sonner";

const Index = () => {
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [isCloning, setIsCloning] = useState(false);
  const [clonedSite, setClonedSite] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"clone" | "editor">("clone");

  const handleClone = async (url: string) => {
    setIsCloning(true);
    setCurrentUrl(url);
    
    try {
      // Simulate cloning process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock cloned site data
      setClonedSite({
        url,
        html: `<html><head><title>Cloned Site</title></head><body><h1>Welcome to ${url}</h1><p>This is a cloned website</p></body></html>`,
        assets: ["style.css", "script.js", "image.jpg"]
      });
      
      setActiveTab("editor");
      toast.success("Site clonado com sucesso!");
    } catch (error) {
      toast.error("Erro ao clonar o site");
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {activeTab === "clone" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold gradient-bg bg-clip-text text-transparent">
                Liveturb Cloner
              </h1>
              <p className="text-xl text-muted-foreground">
                Clone qualquer site e edite com IA em tempo real
              </p>
            </div>
            
            <UrlInput onClone={handleClone} isLoading={isCloning} />
          </div>
        )}
        
        {activeTab === "editor" && clonedSite && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
            <div className="lg:col-span-3">
              <VisualEditor clonedSite={clonedSite} />
            </div>
            <div className="lg:col-span-1">
              <AiPanel />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
