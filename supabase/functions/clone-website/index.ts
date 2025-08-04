import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CloneRequest {
  url: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url }: CloneRequest = await req.json();
    
    if (!url || !isValidUrl(url)) {
      return new Response(
        JSON.stringify({ error: 'URL inválida fornecida' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Clonando site: ${url}`);

    // Fetch the website content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Falha ao buscar o site: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract basic assets from HTML
    const assets = extractAssets(html, url);
    
    // Process HTML to make paths relative/absolute as needed
    const processedHtml = processHtml(html, url);

    const result = {
      url,
      html: processedHtml,
      assets,
      clonedAt: new Date().toISOString(),
      status: 'success'
    };

    console.log(`Site clonado com sucesso: ${assets.length} assets encontrados`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao clonar site:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Falha ao clonar o site', 
        details: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function extractAssets(html: string, baseUrl: string): string[] {
  const assets: string[] = [];
  const assetRegexes = [
    /<link[^>]+href=["']([^"']+)["']/gi,
    /<script[^>]+src=["']([^"']+)["']/gi,
    /<img[^>]+src=["']([^"']+)["']/gi,
    /<source[^>]+src=["']([^"']+)["']/gi,
  ];

  assetRegexes.forEach(regex => {
    let match;
    while ((match = regex.exec(html)) !== null) {
      try {
        const assetUrl = new URL(match[1], baseUrl).href;
        if (!assets.includes(assetUrl)) {
          assets.push(assetUrl);
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    }
  });

  return assets;
}

function processHtml(html: string, baseUrl: string): string {
  // Convert relative URLs to absolute URLs
  const base = new URL(baseUrl);
  
  return html
    .replace(/href=["']([^"']+)["']/gi, (match, url) => {
      if (url.startsWith('http') || url.startsWith('//') || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) {
        return match;
      }
      try {
        const absoluteUrl = new URL(url, base).href;
        return `href="${absoluteUrl}"`;
      } catch (e) {
        return match;
      }
    })
    .replace(/src=["']([^"']+)["']/gi, (match, url) => {
      if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) {
        return match;
      }
      try {
        const absoluteUrl = new URL(url, base).href;
        return `src="${absoluteUrl}"`;
      } catch (e) {
        return match;
      }
    });
}