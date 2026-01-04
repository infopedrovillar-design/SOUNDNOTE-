
import { GoogleGenAI, Type } from "@google/genai";
import { IdentifyCandidate, SearchFilters } from "../types";

export const rescueMusic = async (query: string, filters: SearchFilters): Promise<IdentifyCandidate[]> => {
  // Always obtain API_KEY from environment and initialize directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const filterContext = `
    Filtros adicionais:
    - Estilo: ${filters.genre || 'Não especificado'}
    - Voz: ${filters.vocalType || 'Não especificada'}
    - Época: ${filters.era || 'Não especificada'}
    - Origem: ${filters.origin || 'Não especificada'}
    - Onde ouviu: ${filters.context || 'Não especificado'}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Resgate a música baseada neste fragmento: "${query}". ${filterContext}`,
    config: {
      systemInstruction: `Você é o SOUNDNOTE, um resgatador de memórias musicais.
      Sua missão é identificar músicas a partir de lembranças imperfeitas.
      Retorne SEMPRE uma lista de até 3 candidatos em JSON.
      Seja honesto com a porcentagem de confiança (confidence de 0 a 100).
      
      Formato JSON esperado:
      {
        "candidates": [
          {
            "name": "Nome da música",
            "artist": "Nome do artista",
            "info": "Ano aproximado / Álbum",
            "genre": "Estilo musical",
            "report": "Mini-relatório acolhedor (1-2 frases) sobre por que esta música combina com a memória.",
            "confidence": 85
          }
        ]
      }
      Se não houver nenhuma chance, retorne uma lista vazia.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          candidates: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                artist: { type: Type.STRING },
                info: { type: Type.STRING },
                genre: { type: Type.STRING },
                report: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ["name", "artist", "info", "genre", "report", "confidence"]
            }
          }
        }
      }
    }
  });

  try {
    // Correctly accessing the text property from the response.
    const data = JSON.parse(response.text || '{"candidates": []}');
    return data.candidates;
  } catch (e) {
    console.error("Erro ao processar resgate:", e);
    return [];
  }
};
