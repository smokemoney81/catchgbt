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

    // Alle Nutzer erhalten jetzt detaillierte Antworten
    const systemPrompt = 'Du bist CatchGBT, ein professioneller Angel-Experte. Gib detaillierte, umfassende Antworten mit Hintergrundinformationen, Beispielen und Profi-Tipps. Keine Emojis.';

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