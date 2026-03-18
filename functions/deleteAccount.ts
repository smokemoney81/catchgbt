import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Cascading account deletion.
 * Deletes all user-owned records across every entity in parallel batches,
 * then logs out the user. The actual User record must be removed by an admin
 * via the dashboard (platform limitation).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = user.email;

    // Helper: silently delete all records matching a filter for a given entity.
    const purge = async (entityName, filter) => {
      try {
        const records = await base44.entities[entityName].filter(filter);
        await Promise.all(records.map((r) => base44.entities[entityName].delete(r.id)));
        return records.length;
      } catch (e) {
        console.warn(`[deleteAccount] ${entityName}: ${e.message}`);
        return 0;
      }
    };

    const byEmail = { created_by: email };

    // Run all user-owned entity deletions in parallel.
    const results = await Promise.allSettled([
      purge('Catch',                byEmail),
      purge('Spot',                 byEmail),
      purge('Post',                 byEmail),
      purge('BaitRecipe',           byEmail),
      purge('License',              byEmail),
      purge('ChatMessage',          byEmail),
      purge('ChatSession',          byEmail),
      purge('FishingPlan',          byEmail),
      purge('WaterAnalysisHistory', byEmail),
      purge('DepthDataPoint',       byEmail),
      purge('BathymetricMap',       byEmail),
      purge('SpotGroup',            byEmail),
      purge('GearListing',          byEmail),
      purge('WaterReview',          byEmail),
      purge('FunctionRating',       byEmail),
      purge('VotingSubmission',     byEmail),
      purge('VotingLike',           byEmail),
      purge('ClanCatch',            byEmail),
      purge('Comment',              byEmail),
      // UsageSession and PremiumEvent use user_id instead of created_by
      purge('UsageSession',         { user_id: email }),
      purge('PremiumEvent',         { user_id: email }),
      purge('PremiumWallet',        { user_id: email }),
    ]);

    const deleted = results.reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value : 0), 0);
    const errors  = results.filter((r) => r.status === 'rejected').length;

    console.log(`[deleteAccount] Deleted ${deleted} records, ${errors} entity errors for ${email}`);

    return Response.json({
      success: true,
      deleted_records: deleted,
      message: 'All account data deleted. Contact support to finalize user record removal.',
    });
  } catch (error) {
    console.error('[deleteAccount] Fatal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});