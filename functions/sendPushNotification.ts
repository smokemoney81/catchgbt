import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      user_id, 
      title, 
      body, 
      notification_type,
      data = {} 
    } = await req.json();

    if (!user_id || !title || !body) {
      return Response.json({ 
        error: "Missing required fields: user_id, title, body" 
      }, { status: 400 });
    }

    // Prüfe ob Nutzer Notifications erlaubt hat
    const targetUser = await base44.asServiceRole.entities.User.get(user_id);
    
    if (!targetUser?.settings?.notifications_enabled) {
      return Response.json({ 
        success: false, 
        reason: "Notifications disabled by user" 
      });
    }

    // Prüfe spezifische Notification-Typen
    const notificationSettings = targetUser.settings?.notification_types || {};
    
    if (notification_type && notificationSettings[notification_type] === false) {
      return Response.json({ 
        success: false, 
        reason: `Notification type ${notification_type} disabled by user` 
      });
    }

    // Speichere Notification in DB für History
    await base44.asServiceRole.entities.Notification.create({
      user_id,
      title,
      body,
      notification_type: notification_type || 'general',
      data: JSON.stringify(data),
      sent_at: new Date().toISOString(),
      is_read: false
    });

    // TODO: Integration mit Push-Provider (Firebase, OneSignal, etc.)
    // Hier würde der tatsächliche Push-Versand stattfinden
    console.log(`[Push] Would send to ${user_id}: ${title}`);

    return Response.json({ 
      success: true,
      message: "Notification sent successfully"
    });

  } catch (error) {
    console.error('Error sending push notification:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});