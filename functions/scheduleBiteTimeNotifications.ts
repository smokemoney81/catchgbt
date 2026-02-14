import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Hole alle User mit aktivierten Bite-Time Notifications
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    const eligibleUsers = allUsers.filter(u => 
      u.settings?.notifications_enabled && 
      u.settings?.notification_types?.bite_time !== false &&
      (u.premium_plan_id === 'premium' || u.premium_plan_id === 'pro')
    );

    console.log(`[BiteTime] Found ${eligibleUsers.length} eligible users`);

    let sentCount = 0;

    for (const targetUser of eligibleUsers) {
      try {
        // Hole aktive Spots des Users
        const userSpots = await base44.asServiceRole.entities.Spot.filter({
          created_by: targetUser.email,
          is_favorite: true
        }, '-created_date', 5);

        if (userSpots.length === 0) continue;

        // Berechne Bite-Time Score (vereinfacht)
        const hour = new Date().getHours();
        let isBiteTime = false;
        let timeWindow = '';

        // Morgen-Dämmerung (5-8 Uhr) und Abend-Dämmerung (18-21 Uhr)
        if ((hour >= 5 && hour <= 8) || (hour >= 18 && hour <= 21)) {
          isBiteTime = true;
          timeWindow = hour <= 8 ? 'Morgendaemmerung' : 'Abenddaemmerung';
        }

        if (isBiteTime) {
          // Sende Notification
          await base44.asServiceRole.functions.invoke('sendPushNotification', {
            user_id: targetUser.email,
            title: 'Optimale Beisszeit!',
            body: `Jetzt ist ${timeWindow} - beste Chancen an deinen Lieblingsspots!`,
            notification_type: 'bite_time',
            data: {
              spots: userSpots.map(s => s.id),
              time_window: timeWindow
            }
          });
          
          sentCount++;
        }
      } catch (userError) {
        console.error(`Error processing user ${targetUser.email}:`, userError);
      }
    }

    return Response.json({ 
      success: true,
      eligible_users: eligibleUsers.length,
      notifications_sent: sentCount
    });

  } catch (error) {
    console.error('Error in scheduleBiteTimeNotifications:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});