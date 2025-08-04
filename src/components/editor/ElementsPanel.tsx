import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Type, 
  Image, 
  Link, 
  Code2, 
  Video, 
  MousePointer,
  Layers,
  Plus
} from "lucide-react";

const elements = [
  { icon: Type, label: "Título", type: "heading", color: "text-primary" },
  { icon: Type, label: "Parágrafo", type: "paragraph", color: "text-secondary" },
  { icon: Image, label: "Imagem", type: "image", color: "text-accent" },
  { icon: Link, label: "Link", type: "link", color: "text-primary" },
  { icon: Video, label: "Vídeo", type: "video", color: "text-secondary" },
  { icon: Code2, label: "HTML", type: "html", color: "text-accent" },
];

export function ElementsPanel() {
  return (
    <Card className="glass-effect h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-primary" />
          <span>Elementos</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {elements.map((element) => (
            <Button
              key={element.type}
              variant="ghost"
              className="w-full justify-start h-12 hover:bg-muted/50 border border-transparent hover:border-primary/20"
              draggable
            >
              <element.icon className={`w-5 h-5 mr-3 ${element.color}`} />
              <span>{element.label}</span>
              <Plus className="w-4 h-4 ml-auto text-muted-foreground" />
            </Button>
          ))}
        </div>
        
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center">
            <MousePointer className="w-4 h-4 mr-2" />
            Componentes
          </h3>
          
          <div className="space-y-2">
            <Badge variant="outline" className="w-full justify-start p-2">
              🎨 Header
            </Badge>
            <Badge variant="outline" className="w-full justify-start p-2">
              📝 Footer
            </Badge>
            <Badge variant="outline" className="w-full justify-start p-2">
              🖼️ Gallery
            </Badge>
            <Badge variant="outline" className="w-full justify-start p-2">
              📞 Contact Form
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}