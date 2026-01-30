import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WritingRequest {
  action: 'continue' | 'rewrite' | 'expand' | 'summarize' | 'dialogue' | 'describe' | 'draft';
  content: string;
  context: {
    storyTitle: string;
    genre: string;
    tone: string;
    characters?: Array<{ name: string; role: string; traits?: string[]; backstory?: string }>;
    lore?: Array<{ title: string; content: string; category?: string }>;
    outline?: { acts?: Array<{ title: string; description: string }>; arcs?: Array<{ name: string; description: string }> };
    storyMap?: Array<{ title: string; type: string; description?: string }>;
    chapterTitle?: string;
    chapterNumber?: number;
    previousChapterSummary?: string;
    narrativeIntent?: string;
    stakes?: string;
  };
  instructions?: string;
  settings?: {
    useLore?: boolean;
    useOutline?: boolean;
    useStoryMap?: boolean;
    useCharacters?: boolean;
    temperature?: number;
    model?: string;
  };
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

    const { action, content, context, instructions, settings }: WritingRequest = await req.json();

    // Build rich context based on settings
    let characterContext = '';
    if (settings?.useCharacters !== false && context.characters?.length) {
      characterContext = `\n\n## KEY CHARACTERS:\n${context.characters.map(c => 
        `- **${c.name}** (${c.role}): ${c.traits?.join(', ') || 'No traits specified'}${c.backstory ? `\n  Background: ${c.backstory.slice(0, 200)}...` : ''}`
      ).join('\n')}`;
    }

    let loreContext = '';
    if (settings?.useLore !== false && context.lore?.length) {
      loreContext = `\n\n## WORLD LORE:\n${context.lore.slice(0, 8).map(l => 
        `- **${l.title}** (${l.category || 'general'}): ${l.content?.slice(0, 300) || 'No content'}...`
      ).join('\n')}`;
    }

    let outlineContext = '';
    if (settings?.useOutline !== false && context.outline) {
      const acts = context.outline.acts?.map(a => `- ${a.title}: ${a.description}`).join('\n') || '';
      const arcs = context.outline.arcs?.map(a => `- ${a.name}: ${a.description}`).join('\n') || '';
      if (acts || arcs) {
        outlineContext = `\n\n## STORY STRUCTURE:\n${acts ? `Acts:\n${acts}` : ''}${arcs ? `\nArcs:\n${arcs}` : ''}`;
      }
    }

    let storyMapContext = '';
    if (settings?.useStoryMap !== false && context.storyMap?.length) {
      storyMapContext = `\n\n## STORY MAP ELEMENTS:\n${context.storyMap.slice(0, 10).map(n => 
        `- [${n.type}] ${n.title}${n.description ? `: ${n.description.slice(0, 100)}` : ''}`
      ).join('\n')}`;
    }

    let narrativeContext = '';
    if (context.narrativeIntent || context.stakes) {
      narrativeContext = `\n\n## NARRATIVE VISION:${context.narrativeIntent ? `\nIntent: ${context.narrativeIntent}` : ''}${context.stakes ? `\nStakes: ${context.stakes}` : ''}`;
    }

    let chapterContext = '';
    if (context.chapterTitle || context.previousChapterSummary) {
      chapterContext = `\n\n## CURRENT CHAPTER:${context.chapterNumber ? `\nChapter ${context.chapterNumber}` : ''}${context.chapterTitle ? `: ${context.chapterTitle}` : ''}${context.previousChapterSummary ? `\n\nPrevious chapter summary: ${context.previousChapterSummary}` : ''}`;
    }

    const systemPrompt = `You are Loomy, an expert narrative writer helping craft a ${context.genre} story titled "${context.storyTitle}". 
The tone is ${context.tone}.
${characterContext}
${loreContext}
${outlineContext}
${storyMapContext}
${narrativeContext}
${chapterContext}

## WRITING GUIDELINES:
- Match the established style and voice
- NEVER contradict established facts from lore, characters, or world details
- Write vivid, immersive prose with sensory details
- Show don't tell when possible
- Maintain consistent POV and tense
- Use character names and reference established elements naturally
- Create compelling hooks and tension`;

    let userPrompt = '';
    
    switch (action) {
      case 'draft':
        userPrompt = `Write an opening draft for this chapter. Create an engaging start that:
- Establishes the scene with vivid sensory details
- Introduces or continues character presence naturally
- Sets up tension or intrigue
- Flows from previous events (if any)

Chapter context: "${content}"

${instructions ? `Specific direction: ${instructions}` : ''}

Write 3-5 compelling paragraphs. Only output the story text, no metadata.`;
        break;

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

    const modelToUse = settings?.model || "google/gemini-3-flash-preview";
    const temperature = settings?.temperature || 0.85;

    console.log(`AI Writing: action=${action}, model=${modelToUse}, temp=${temperature}`);
    console.log(`Context: ${characterContext ? 'chars✓' : ''} ${loreContext ? 'lore✓' : ''} ${outlineContext ? 'outline✓' : ''} ${storyMapContext ? 'map✓' : ''}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens: 3000,
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
