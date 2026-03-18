import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      console.log('[TTS] User not authenticated - using browser fallback');
      return Response.json({ 
        fallback_to_browser: true,
        reason: 'Not authenticated'
      });
    }

    const body = await req.json().catch(() => ({}));
    const { text, speechRate = 1.0, voiceId = "alloy", quality = "standard" } = body;
    
    if (!text || typeof text !== 'string') {
      console.log('[TTS] Invalid text input - using browser fallback');
      return Response.json({ 
        fallback_to_browser: true,
        reason: 'Invalid text'
      });
    }

    const cleanText = String(text).slice(0, 1000).trim();
    
    if (!cleanText) {
      console.log('[TTS] Empty text after cleaning - using browser fallback');
      return Response.json({ 
        fallback_to_browser: true,
        reason: 'Empty text'
      });
    }

    console.log(`[TTS] Processing: ${cleanText.length} chars for ${user.email}`);

    // Prüfe alle verfügbaren API Keys
    const openAiKey = Deno.env.get('openaitts2') || Deno.env.get('adminopenaitts') || Deno.env.get('Catchgbt');
    
    if (!openAiKey) {
      console.log('[TTS] No OpenAI API key found - using browser fallback');
      return Response.json({ 
        fallback_to_browser: true,
        reason: 'No API key'
      });
    }

    try {
      console.log('[TTS] Calling OpenAI TTS API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 Sekunden Timeout
      
      const openAiResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: quality === 'hd' ? 'tts-1-hd' : 'tts-1',
          voice: voiceId,
          input: cleanText,
          speed: Math.min(4.0, Math.max(0.25, speechRate))
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!openAiResponse.ok) {
        const errorText = await openAiResponse.text();
        console.error('[TTS] OpenAI API error:', openAiResponse.status, errorText);
        return Response.json({ 
          fallback_to_browser: true,
          reason: `API error: ${openAiResponse.status}`
        });
      }

      const audioData = await openAiResponse.arrayBuffer();
      
      if (!audioData || audioData.byteLength === 0) {
        console.error('[TTS] OpenAI returned empty audio');
        return Response.json({ 
          fallback_to_browser: true,
          reason: 'Empty audio data'
        });
      }

      console.log(`[TTS] Success: ${audioData.byteLength} bytes`);
      
      return new Response(audioData, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioData.byteLength.toString(),
          'Cache-Control': 'no-cache'
        }
      });

    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error('[TTS] Request timeout');
        return Response.json({ 
          fallback_to_browser: true,
          reason: 'Timeout'
        });
      }
      
      console.error('[TTS] Fetch error:', fetchError.message);
      return Response.json({ 
        fallback_to_browser: true,
        reason: fetchError.message
      });
    }

  } catch (error) {
    console.error('[TTS] Unexpected error:', error.message);
    return Response.json({ 
      fallback_to_browser: true,
      reason: 'Unexpected error'
    });
  }
});