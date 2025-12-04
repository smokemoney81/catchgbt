import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

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

    const recentMessages = messages.slice(-4);

    const systemPrompt = `Du bist CatchGBT, der Angel-Buddy.

${isPremium ? 'KEINE Emojis. Detailliert.' : 'Kompakt.'}
Kontext: ${context}

Expertise: Fischarten, Koeder, Spots, Wetter, Ausruestung.
Antworte kurz und praktisch.`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: systemPrompt + "\n\nFrage: " + (recentMessages[recentMessages.length - 1]?.content || "Hallo"),
      add_context_from_internet: false
    });

    const reply = llmResponse || "Ups, da gab's ein Problem. Versuch's nochmal!";

    console.log(`LLM Response OK`);

    return Response.json({ reply });

  } catch (error) {
    console.error('Error in catchgbtChat:', error.message);
    
    return Response.json({ 
      reply: "Entschuldigung, ich bin gerade ueberlastet. Versuch's in 10 Sekunden nochmal!"
    });
  }
});