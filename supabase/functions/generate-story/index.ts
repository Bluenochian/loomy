import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateRequest {
  type: 'full_generation' | 'continue_chapter' | 'expand_character' | 'expand_lore' | 'recompute_theme';
  projectData: {
    concept: string;
    language: string;
    tone_value: number;
    genre_influences: string[];
    existing_content?: {
      overview?: unknown;
      outline?: unknown;
      chapters?: unknown[];
      characters?: unknown[];
      lore?: unknown[];
    };
  };
  additionalContext?: string;
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

    const requestData: GenerateRequest = await req.json();
    const { type, projectData, additionalContext } = requestData;

    let systemPrompt = "";
    let userPrompt = "";

    const toneDescription = projectData.tone_value < 0.3 
      ? "hopeful and uplifting" 
      : projectData.tone_value > 0.7 
        ? "dark and intense" 
        : "balanced with both light and shadow";

    const genreContext = projectData.genre_influences.length > 0
      ? `with influences from ${projectData.genre_influences.join(', ')}`
      : "";

    switch (type) {
      case 'full_generation':
        systemPrompt = `You are STORYLOOM, an expert narrative architect and world-builder. Your role is to deeply analyze story concepts and generate comprehensive, interconnected story elements.

You must ALWAYS respond with valid JSON matching the exact structure specified. Never include markdown code blocks or explanations outside the JSON.

Your writing style should be ${toneDescription}. Language: ${projectData.language}.`;

        userPrompt = `Analyze this story concept and generate a complete story foundation:

CONCEPT: "${projectData.concept}"
${genreContext ? `GENRE INFLUENCES: ${genreContext}` : ''}
TONE: ${toneDescription}

Generate a JSON response with this EXACT structure:
{
  "inferred_genres": {
    "primary": "string - the main genre detected",
    "secondary": ["array of 1-3 secondary genres"],
    "weights": {"genre_name": 0.0-1.0}
  },
  "story_overview": {
    "narrative_intent": "2-3 sentences describing the core narrative purpose",
    "central_themes": ["3-5 main themes"],
    "stakes": "What's at risk - personal, societal, existential",
    "setting_description": "Vivid description of the world/setting",
    "time_period": "When the story takes place"
  },
  "outline": {
    "acts": [
      {
        "number": 1,
        "title": "Act title",
        "description": "What happens in this act",
        "chapter_count": 3-5
      }
    ],
    "arcs": [
      {
        "name": "Arc name",
        "description": "Arc description",
        "type": "main|subplot|character",
        "status": "setup"
      }
    ],
    "conflicts": [
      {
        "type": "internal|external|interpersonal|societal",
        "description": "Conflict description",
        "characters": ["character names involved"]
      }
    ]
  },
  "chapters": [
    {
      "chapter_number": 1,
      "title": "Chapter title",
      "intent": "What this chapter accomplishes narratively"
    }
  ],
  "characters": [
    {
      "name": "Character name",
      "role": "protagonist|antagonist|supporting|minor",
      "description": "Physical and personality description",
      "backstory": "Brief backstory",
      "motivations": ["2-3 core motivations"],
      "traits": ["4-6 personality traits"],
      "arc": {
        "startingState": "Where they begin emotionally/mentally",
        "desiredChange": "What they need to learn/become",
        "endingState": "Where they end up"
      }
    }
  ],
  "lore_entries": [
    {
      "category": "world|magic|technology|culture|history|rules",
      "title": "Entry title",
      "content": "Detailed content about this aspect of the world",
      "tags": ["relevant", "tags"]
    }
  ],
  "theme_profile": {
    "colorPalette": {
      "primary": "hex color that represents the story's essence",
      "secondary": "complementary hex color",
      "accent": "accent hex color for highlights",
      "background": "dark background hex color"
    },
    "mood": "One word capturing the visual mood"
  }
}

Generate at least:
- 3 acts with 3-4 chapters each (8-12 chapters total)
- 4-6 characters (at least 1 protagonist, 1 antagonist)
- 5-8 lore entries covering different aspects of the world
- 2-3 story arcs
- 2-3 conflicts`;
        break;

      case 'continue_chapter':
        systemPrompt = `You are STORYLOOM, a master storyteller. You continue narrative prose that matches the established style, tone, and voice. You NEVER contradict established facts. Your writing is ${toneDescription}.`;
        
        userPrompt = `Continue this chapter naturally. Write 2-3 paragraphs that flow seamlessly from the existing content.

${additionalContext}

Respond with ONLY the continuation text, no JSON or metadata.`;
        break;

      case 'expand_character':
        systemPrompt = `You are STORYLOOM, an expert character psychologist. You deeply understand character motivation, psychology, and arc development.`;
        
        userPrompt = `Expand on this character with deeper insights:

${additionalContext}

Respond with JSON:
{
  "expanded_backstory": "Detailed backstory exploration",
  "psychological_profile": "Deep dive into their psychology",
  "key_relationships": [{"with": "character", "dynamic": "description"}],
  "pivotal_moments": ["Moments that shaped them"],
  "internal_conflicts": ["Their inner struggles"],
  "growth_opportunities": ["How they might change"]
}`;
        break;

      case 'expand_lore':
        systemPrompt = `You are STORYLOOM, a master world-builder. You create rich, internally consistent lore that enhances the narrative.`;
        
        userPrompt = `Expand this lore entry with greater depth and detail:

${additionalContext}

Respond with JSON:
{
  "expanded_content": "Much more detailed version of the lore",
  "connections": ["How this connects to other story elements"],
  "implications": ["What this means for the narrative"],
  "related_entries": [{"title": "Related topic", "brief": "Brief description"}]
}`;
        break;

      case 'recompute_theme':
        systemPrompt = `You are STORYLOOM's theme engine. You analyze story content and generate appropriate visual themes.`;
        
        userPrompt = `Based on this story's current state, generate an updated theme profile:

${JSON.stringify(projectData.existing_content)}

Respond with JSON:
{
  "colorPalette": {
    "primary": "hex color representing the story's current emotional state",
    "secondary": "complementary hex",
    "accent": "accent hex",
    "background": "dark background hex"
  },
  "typography": {
    "displayFont": "Playfair Display|Inter|Georgia",
    "bodyFont": "Inter|Georgia|system-ui"
  },
  "visualStyle": {
    "texture": "paper|digital|grunge|clean",
    "motionIntensity": "subtle|moderate|dynamic",
    "depth": "flat|layered|immersive"
  },
  "mood": "single word mood descriptor"
}`;
        break;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 8000,
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // For non-JSON responses (like chapter continuation)
    if (type === 'continue_chapter') {
      return new Response(
        JSON.stringify({ content }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON response
    let parsedContent;
    try {
      // Remove any markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedContent = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      throw new Error("Invalid JSON in AI response");
    }

    return new Response(
      JSON.stringify({ result: parsedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Story generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
