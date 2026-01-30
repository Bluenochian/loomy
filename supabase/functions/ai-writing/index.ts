import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WritingRequest {
  action: 'continue' | 'rewrite' | 'expand' | 'summarize' | 'dialogue' | 'describe';
  content: string;
  context: {
    storyTitle: string;
    genre: string;
    tone: string;
    characters?: Array<{ name: string; role: string; traits?: string[] }>;
    lore?: Array<{ title: string; content: string }>;
    chapterTitle?: string;
    previousContent?: string;
  };
  instructions?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { action, content, context, instructions }: WritingRequest = await req.json();

    const characterContext = context.characters?.length 
      ? `\n\nKEY CHARACTERS:\n${context.characters.map(c => `- ${c.name} (${c.role}): ${c.traits?.join(', ') || 'No traits specified'}`).join('\n')}`
      : '';

    const loreContext = context.lore?.length
      ? `\n\nWORLD LORE:\n${context.lore.slice(0, 5).map(l => `- ${l.title}: ${l.content.slice(0, 200)}...`).join('\n')}`
      : '';

    const systemPrompt = `You are Loomy, an expert narrative writer helping craft a ${context.genre} story titled "${context.storyTitle}". 
The tone is ${context.tone}.
${characterContext}
${loreContext}

Writing guidelines:
- Match the established style and voice
- Never contradict established facts
- Write vivid, immersive prose
- Show don't tell when possible
- Maintain consistent POV and tense`;

    let userPrompt = '';
    
    switch (action) {
      case 'continue':
        userPrompt = `Continue this passage naturally with 2-3 paragraphs that flow seamlessly:

"${content}"

${instructions ? `Additional instructions: ${instructions}` : ''}

Write ONLY the continuation, no explanations or metadata.`;
        break;

      case 'rewrite':
        userPrompt = `Rewrite this passage to be more engaging while maintaining the same meaning and events:

"${content}"

${instructions ? `Style guidance: ${instructions}` : ''}

Write ONLY the rewritten passage.`;
        break;

      case 'expand':
        userPrompt = `Expand this passage with more detail, sensory descriptions, and emotional depth:

"${content}"

${instructions ? `Focus on: ${instructions}` : ''}

Write ONLY the expanded passage.`;
        break;

      case 'summarize':
        userPrompt = `Create a concise summary of this content for reference:

"${content}"

Write a clear, informative summary in 2-3 sentences.`;
        break;

      case 'dialogue':
        userPrompt = `Write a dialogue scene based on this context:

"${content}"

${instructions ? `Scene context: ${instructions}` : ''}

Write natural, character-appropriate dialogue with action beats. Include dialogue tags sparingly.`;
        break;

      case 'describe':
        userPrompt = `Write a vivid description based on this prompt:

"${content}"

${instructions ? `Focus: ${instructions}` : ''}

Write an immersive, sensory-rich description in 2-3 paragraphs.`;
        break;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.85,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Return the stream directly
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("AI writing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
