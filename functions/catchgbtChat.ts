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

    const userMessage = messages[messages.length - 1]?.content || "";
    
    const systemPrompt = `Du bist CatchGBT, ein freundlicher Angel-Experte und Gespraechspartner. 

Verhalten:
- Fuehre natuerliche Gespraeche wie ein Freund
- Bei Begruessungen (Hallo, Hi, Hey, Moin etc.) antworte freundlich zurueck und frage wie du helfen kannst
- Bei Small Talk sei hoeflich und persoenlich
- Bei Fachfragen zu Angeln, Fischarten, Koeder, Wetter, Ausruestung antworte kompetent
- Keine Emojis
- ${isPremium ? 'Detailliert antworten' : 'Kurz und praegnant antworten'}`;

    const conversationHistory = messages.slice(-6).map(msg => 
      `${msg.role === 'user' ? 'Nutzer' : 'Du'}: ${msg.content}`
    ).join('\n');

    const fullPrompt = `${systemPrompt}\n\nKonversation:\n${conversationHistory}\n\nAntworte jetzt auf die letzte Nachricht:`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      add_context_from_internet: false
    });

    const reply = typeof llmResponse === 'string' ? llmResponse : (llmResponse?.content || "Hey! Frag mich was zu Angeln!");

    console.log(`LLM Response OK`);

    return Response.json({ reply });

  } catch (error) {
    console.error('Error in catchgbtChat:', error);
    
    const fallbackReplies = [
      "Da ist etwas schiefgegangen. Was wolltest du wissen?",
      "Ups, kurz abgelenkt! Kannst du das nochmal versuchen?",
      "Sorry, hatte einen Aussetzer. Wie kann ich dir helfen?"
    ];
    
    return Response.json({ 
      reply: fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
    });
  }
});