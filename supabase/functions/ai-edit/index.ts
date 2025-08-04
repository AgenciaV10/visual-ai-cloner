import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

interface AIEditRequest {
  command: string;
  currentHtml: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Chave da API Gemini não configurada' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { command, currentHtml }: AIEditRequest = await req.json();
    
    if (!command || !currentHtml) {
      return new Response(
        JSON.stringify({ error: 'Comando e HTML atual são obrigatórios' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processando comando AI: ${command.substring(0, 100)}...`);

    const prompt = createEditPrompt(command, currentHtml);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro da API Gemini:', errorData);
      throw new Error(`Erro da API Gemini: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Resposta inválida da API Gemini');
    }

    const generatedCode = data.candidates[0].content.parts[0].text;
    
    // Extract JavaScript code from the response
    const jsCode = extractJavaScriptCode(generatedCode);
    
    console.log(`Código gerado com sucesso: ${jsCode.substring(0, 100)}...`);

    return new Response(JSON.stringify({ 
      jsCode,
      originalResponse: generatedCode,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na edição AI:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Falha ao processar comando de IA', 
        details: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function createEditPrompt(command: string, currentHtml: string): string {
  return `Você é um assistente especializado em edição de HTML via JavaScript. 

COMANDO DO USUÁRIO: "${command}"

HTML ATUAL:
${currentHtml}

Sua tarefa é analisar o comando do usuário e gerar APENAS o código JavaScript necessário para executar a mudança solicitada no HTML fornecido.

REGRAS IMPORTANTES:
1. Retorne APENAS código JavaScript válido
2. Use seletores DOM precisos (querySelector, getElementById, etc.)
3. O código deve ser executável diretamente no navegador
4. Não inclua explicações ou texto adicional
5. Se precisar criar elementos, use createElement e appendChild
6. Para alterar estilos, use element.style ou classList
7. Para mudar texto, use textContent ou innerHTML conforme apropriado
8. Se o comando for impossível de executar, retorne: console.log("Comando não executável: [motivo]");

EXEMPLOS:
Comando: "Mude o título principal para 'Novo Título'"
Resposta: document.querySelector('h1').textContent = 'Novo Título';

Comando: "Mude a cor do botão principal para azul"
Resposta: document.querySelector('button').style.backgroundColor = '#0066cc';

Agora gere o código JavaScript para: "${command}"`;
}

function extractJavaScriptCode(response: string): string {
  // Remove markdown code blocks if present
  let code = response.replace(/```javascript\n?/g, '').replace(/```\n?/g, '');
  
  // Remove any explanatory text and keep only the JS code
  const lines = code.split('\n');
  const jsLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed && 
           !trimmed.startsWith('//') && 
           !trimmed.startsWith('/*') && 
           !trimmed.match(/^[A-Z][a-z\s:]+$/); // Remove explanatory sentences
  });
  
  return jsLines.join('\n').trim();
}
