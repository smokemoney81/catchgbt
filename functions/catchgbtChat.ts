import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages = [], context = 'general', detailLevel = 'standard' } = await req.json();

    console.log(`KI-Buddy Request: User=${user.email}, Messages=${messages.length}`);

    const planId = user?.premium_plan_id || 'free';
    const isPremium = planId === 'pro' || planId === 'ultimate';

    const systemPrompt = `Du bist CatchGBT, der Angel-Buddy. Du bist ein Experte fuer alles rund ums Angeln - Fischarten, Koeder, Spots, Wetter, Ausruestung, Gesetze.

${isPremium ? 'KEINE Emojis. Gib detaillierte und umfassende Antworten.' : 'Antworte praeknant und direkt.'}
Aktueller App-Kontext: ${context}

Antworte hilfreich und spezifisch basierend auf der bisherigen Konversation.`;

    const conversationHistory = messages.slice(-6).map(msg => 
      `${msg.role === 'user' ? 'Nutzer' : 'Assistent'}: ${msg.content}`
    ).join('\n\n');

    const fullPrompt = `${systemPrompt}\n\n--- Bisherige Konversation ---\n${conversationHistory}\n\n--- Deine Antwort ---`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      add_context_from_internet: false
    });

    const reply = llmResponse || "Ups, da gab's ein Problem. Versuch's nochmal!";

    console.log(`LLM Response OK`);

    return Response.json({ reply });

  } catch (error) {
    console.error('Error in catchgbtChat:', error.message);
    
    return Response.json({ 
      reply: "Entschuldigung, das hat zu lange gedauert. Versuchs nochmal!"
    });
  }
});