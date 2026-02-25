import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve((req) => {
    try {
        const iconBaseUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bb3d3b9f83dc1f55ef532b';
        
        const manifest = {
            "id": "com.catchgbt.fishing.assistant.v3",
            "name": "CatchGBT - Dein KI Angel-Assistent von Sebastian Schorn",
            "short_name": "CatchGBT",
            "description": "Angel-App mit KI-Assistent. Finde die besten Angelplätze, erhalte intelligente Tipps und dokumentiere deine Fänge!",
            "start_url": "/",
            "display": "standalone",
            "background_color": "#0b1324",
            "theme_color": "#4285f4",
            "orientation": "portrait-primary",
            "scope": "/",
            "lang": "de-DE",
            "dir": "ltr",
            "categories": ["sports", "lifestyle", "utilities"],
            "icons": [
                {
                    "src": `${iconBaseUrl}/ee5d668e0_icon_32.png`,
                    "sizes": "32x32",
                    "type": "image/png",
                    "purpose": "any"
                },
                {
                    "src": `${iconBaseUrl}/1d1888ec8_icon_72.png`,
                    "sizes": "72x72",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": `${iconBaseUrl}/1d1888ec8_icon_72.png`,
                    "sizes": "96x96",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": `${iconBaseUrl}/1d1888ec8_icon_72.png`,
                    "sizes": "128x128",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": `${iconBaseUrl}/1d1888ec8_icon_72.png`,
                    "sizes": "144x144",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": `${iconBaseUrl}/1d1888ec8_icon_72.png`,
                    "sizes": "152x152",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": `${iconBaseUrl}/e9d6eda08_icon_512.png`,
                    "sizes": "192x192",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": `${iconBaseUrl}/e9d6eda08_icon_512.png`,
                    "sizes": "384x384",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": `${iconBaseUrl}/e9d6eda08_icon_512.png`,
                    "sizes": "512x512",
                    "type": "image/png",
                    "purpose": "any maskable"
                }
            ],
            "shortcuts": [
                {
                    "name": "KI-Assistent",
                    "short_name": "KI",
                    "description": "Starte den KI Angel-Assistenten",
                    "url": "/AIAssistant",
                    "icons": [{"src": `${iconBaseUrl}/e9d6eda08_icon_512.png`, "sizes": "512x512"}]
                },
                {
                    "name": "Angelplätze",
                    "short_name": "Plätze",
                    "description": "Finde Angelplätze in deiner Nähe",
                    "url": "/Map",
                    "icons": [{"src": `${iconBaseUrl}/e9d6eda08_icon_512.png`, "sizes": "512x512"}]
                },
                {
                    "name": "Fangbuch",
                    "short_name": "Fänge",
                    "description": "Dokumentiere deine Fänge",
                    "url": "/Logbook",
                    "icons": [{"src": `${iconBaseUrl}/e9d6eda08_icon_512.png`, "sizes": "512x512"}]
                },
                {
                    "name": "Wetter",
                    "short_name": "Wetter",
                    "description": "Prüfe das Angelwetter",
                    "url": "/Weather",
                    "icons": [{"src": `${iconBaseUrl}/e9d6eda08_icon_512.png`, "sizes": "512x512"}]
                }
            ],
            "screenshots": [],
            "related_applications": [],
            "prefer_related_applications": false
        };

        return new Response(JSON.stringify(manifest, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/manifest+json',
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});