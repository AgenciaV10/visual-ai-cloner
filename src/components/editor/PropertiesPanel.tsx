import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Palette, 
  Type as TypeIcon, 
  Layout,
  Move
} from "lucide-react";

export function PropertiesPanel() {
  return (
    <Card className="glass-effect h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-primary" />
          <span>Propriedades</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="style">
              <Palette className="w-4 h-4 mr-1" />
              Estilo
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Layout className="w-4 h-4 mr-1" />
              Layout
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="style" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Cor do Texto</Label>
                <div className="flex space-x-2 mt-2">
                  <div className="w-8 h-8 rounded-full bg-primary cursor-pointer border-2 border-white" />
                  <div className="w-8 h-8 rounded-full bg-secondary cursor-pointer border-2 border-white" />
                  <div className="w-8 h-8 rounded-full bg-accent cursor-pointer border-2 border-white" />
                  <div className="w-8 h-8 rounded-full bg-destructive cursor-pointer border-2 border-white" />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Tamanho da Fonte</Label>
                <Slider defaultValue={[16]} max={48} min={8} step={1} className="mt-2" />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Família da Fonte</Label>
                <select className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background">
                  <option>Inter</option>
                  <option>Arial</option>
                  <option>Helvetica</option>
                  <option>Georgia</option>
                </select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Opacidade</Label>
                <Slider defaultValue={[100]} max={100} min={0} step={5} className="mt-2" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="layout" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Largura</Label>
                <Input type="number" placeholder="auto" className="mt-2" />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Altura</Label>
                <Input type="number" placeholder="auto" className="mt-2" />
              </div>
              
              <div>
                <Label className="text-sm font-medium flex items-center">
                  <Move className="w-4 h-4 mr-2" />
                  Margin
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input type="number" placeholder="Top" />
                  <Input type="number" placeholder="Right" />
                  <Input type="number" placeholder="Bottom" />
                  <Input type="number" placeholder="Left" />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium flex items-center">
                  <Move className="w-4 h-4 mr-2" />
                  Padding
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input type="number" placeholder="Top" />
                  <Input type="number" placeholder="Right" />
                  <Input type="number" placeholder="Bottom" />
                  <Input type="number" placeholder="Left" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 pt-4 border-t border-border">
          <Button className="w-full gradient-bg glow-effect">
            Aplicar Mudanças
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}