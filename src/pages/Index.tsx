import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { UrlInput } from "@/components/clone/UrlInput";
import { VisualEditor } from "@/components/editor/VisualEditor";
import { AiPanel } from "@/components/ai/AiPanel";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EditorLayoutProps {
  clonedSite: {
    url: string;
    html: string;
    assets: string[];
  };
}

function EditorLayout({ clonedSite }: EditorLayoutProps) {
  const [currentHtml, setCurrentHtml] = useState(clonedSite.html);

  const handleExecuteCode = (jsCode: string) => {
    console.log("Executando código JavaScript:", jsCode);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
      <div className="lg:col-span-3">
        <VisualEditor 
          clonedSite={clonedSite} 
          onExecuteCode={handleExecuteCode} 
        />
      </div>
      <div className="lg:col-span-1">
        <AiPanel 
          onExecuteCode={handleExecuteCode}
          currentHtml={currentHtml}
        />
      </div>
    </div>
  );
}

const Index = () => {
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [isCloning, setIsCloning] = useState(false);
  const [clonedSite, setClonedSite] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"clone" | "editor">("clone");

  const handleClone = async (url: string) => {
    setIsCloning(true);
    setCurrentUrl(url);
    
    try {
      console.log("Iniciando clonagem do site:", url);
      
      const { data, error } = await supabase.functions.invoke('clone-website', {
        body: { url }
      });
      
      if (error) {
        console.error("Erro na função de clonagem:", error);
        throw new Error(error.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      console.log("Site clonado com sucesso:", data);
      
      setClonedSite({
        url: data.url,
        html: data.html,
        assets: data.assets || []
      });
      
      setActiveTab("editor");
      toast.success("Site clonado com sucesso!");
    } catch (error) {
      console.error("Erro ao clonar site:", error);
      toast.error(`Erro ao clonar o site: ${error.message}`);
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
          <EditorLayout clonedSite={clonedSite} />
        )}
      </main>
    </div>
  );
};

export default Index;
