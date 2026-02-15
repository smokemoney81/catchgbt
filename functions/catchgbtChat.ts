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

    const planResponse = await base44.functions.invoke('getPlanStatus');
    const planId = planResponse?.data?.plan?.id || 'free';

    const planLevels = {
      'free': 'short',
      'basic': 'standard',
      'pro': 'detailed',
      'ultimate': 'very_detailed'
    };

    const responseMode = planLevels[planId] || 'short';

    const systemPrompts = {
      'short': 'Du bist CatchGBT, ein Angel-Experte. Antworte kurz und praegnant (max 2-3 Saetze). Keine Emojis.',
      'standard': 'Du bist CatchGBT, ein freundlicher Angel-Experte. Antworte informativ aber kompakt (3-5 Saetze). Keine Emojis.',
      'detailed': 'Du bist CatchGBT, ein Angel-Experte. Antworte ausfuehrlich und detailliert mit praktischen Tipps. Keine Emojis.',
      'very_detailed': 'Du bist CatchGBT, ein professioneller Angel-Experte. Gib sehr detaillierte, umfassende Antworten mit Hintergrundinformationen, Beispielen und Profi-Tipps. Keine Emojis.'
    };

    const systemPrompt = systemPrompts[responseMode];

    const conversationHistory = messages.slice(-6).map(msg => 
      `${msg.role === 'user' ? 'Nutzer' : 'Du'}: ${msg.content || ''}`
    ).join('\n');

    const fullPrompt = `${systemPrompt}\n\nKonversation:\n${conversationHistory}\n\nAntworte jetzt auf die letzte Nachricht:`;

    let reply = "Entschuldigung, ich konnte keine Antwort generieren. Bitte versuche es spaeter nochmal.";

    try {
      const llmResponse = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        add_context_from_internet: false
      });

      reply = typeof llmResponse === 'string' ? llmResponse : (llmResponse?.content || reply);
    } catch (llmError) {
      console.error('LLM Error:', llmError.message);
    }

    console.log(`Response ready`);

    return Response.json({ reply }, { status: 200 });

  } catch (error) {
    console.error('Critical error in catchgbtChat:', error.message, error);
    
    return Response.json({ 
      reply: "Ein Fehler ist aufgetreten. Bitte versuche es nochmal."
    }, { status: 200 });
  }
});