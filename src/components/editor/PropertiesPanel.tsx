import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Settings, 
  Palette, 
  Type as TypeIcon, 
  Layout,
  Move
} from "lucide-react";

interface PropertiesPanelProps {
  selectedElement?: Element | null;
  onExecuteCode?: (jsCode: string) => void;
}

export function PropertiesPanel({ selectedElement, onExecuteCode }: PropertiesPanelProps) {
  const [textContent, setTextContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState("16");

  useEffect(() => {
    if (selectedElement) {
      setTextContent(selectedElement.textContent || "");
      const computedStyle = window.getComputedStyle(selectedElement);
      setBackgroundColor(computedStyle.backgroundColor || "#ffffff");
      setTextColor(computedStyle.color || "#000000");
      setFontSize((parseInt(computedStyle.fontSize) || 16).toString());
    }
  }, [selectedElement]);

  const applyChanges = () => {
    if (!selectedElement || !onExecuteCode) {
      toast.error("Nenhum elemento selecionado");
      return;
    }

    const elementSelector = generateSelector(selectedElement);
    let jsCode = "";

    if (textContent !== selectedElement.textContent) {
      jsCode += `document.querySelector('${elementSelector}').textContent = '${textContent.replace(/'/g, "\\'")}'; `;
    }

    if (backgroundColor !== "#ffffff") {
      jsCode += `document.querySelector('${elementSelector}').style.backgroundColor = '${backgroundColor}'; `;
    }

    if (textColor !== "#000000") {
      jsCode += `document.querySelector('${elementSelector}').style.color = '${textColor}'; `;
    }

    if (fontSize !== "16") {
      jsCode += `document.querySelector('${elementSelector}').style.fontSize = '${fontSize}px'; `;
    }

    if (jsCode) {
      onExecuteCode(jsCode);
      toast.success("Propriedades aplicadas!");
    } else {
      toast.info("Nenhuma mudança detectada");
    }
  };

  const generateSelector = (element: Element): string => {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        return `.${classes.join('.')}`;
      }
    }
    
    const tagName = element.tagName.toLowerCase();
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(child => child.tagName === element.tagName);
      if (siblings.length > 1) {
        const index = siblings.indexOf(element) + 1;
        return `${tagName}:nth-of-type(${index})`;
      }
    }
    
    return tagName;
  };
  return (
    <Card className="glass-effect h-full">
      <CardHeader>
        <CardTitle className="text-lg">Propriedades</CardTitle>
        {selectedElement && (
          <p className="text-sm text-muted-foreground">
            Editando: {selectedElement.tagName.toLowerCase()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>
          
          <TabsContent value="style" className="space-y-4">
            <div className="space-y-2">
              <Label>Conteúdo do Texto</Label>
              <Input 
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Digite o novo texto..."
                disabled={!selectedElement}
              />
            </div>

            <div className="space-y-2">
              <Label>Cor do Texto</Label>
              <Input 
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                disabled={!selectedElement}
                className="w-full h-10"
              />
            </div>

            <div className="space-y-2">
              <Label>Cor de Fundo</Label>
              <Input 
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                disabled={!selectedElement}
                className="w-full h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tamanho da Fonte: {fontSize}px</Label>
              <Slider
                value={[parseInt(fontSize)]}
                onValueChange={(value) => setFontSize(value[0].toString())}
                max={48}
                min={8}
                step={1}
                className="w-full"
                disabled={!selectedElement}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="layout" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Largura</Label>
                <Input placeholder="auto" disabled={!selectedElement} />
              </div>
              <div className="space-y-2">
                <Label>Altura</Label>
                <Input placeholder="auto" disabled={!selectedElement} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Margem</Label>
              <Input placeholder="0px" disabled={!selectedElement} />
            </div>
            
            <div className="space-y-2">
              <Label>Padding</Label>
              <Input placeholder="0px" disabled={!selectedElement} />
            </div>
          </TabsContent>
        </Tabs>
        
        <Button 
          className="w-full gradient-bg"
          onClick={applyChanges}
          disabled={!selectedElement}
        >
          Aplicar Mudanças
        </Button>
        
        {!selectedElement && (
          <p className="text-sm text-muted-foreground text-center">
            Clique em "Selecionar" e escolha um elemento para editar
          </p>
        )}
      </CardContent>
    </Card>
  );
}