import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete user's data (catches, spots, posts, recipes, etc.)
    try {
      const catches = await base44.entities.Catch.filter({ created_by: user.email });
      for (const c of catches) {
        await base44.entities.Catch.delete(c.id);
      }
    } catch (e) {
      console.log('No catches to delete or error deleting catches:', e.message);
    }

    try {
      const spots = await base44.entities.Spot.filter({ created_by: user.email });
      for (const spot of spots) {
        await base44.entities.Spot.delete(spot.id);
      }
    } catch (e) {
      console.log('No spots to delete or error deleting spots:', e.message);
    }

    try {
      const posts = await base44.entities.Post.filter({ created_by: user.email });
      for (const post of posts) {
        await base44.entities.Post.delete(post.id);
      }
    } catch (e) {
      console.log('No posts to delete or error deleting posts:', e.message);
    }

    try {
      const recipes = await base44.entities.BaitRecipe.filter({ created_by: user.email });
      for (const recipe of recipes) {
        await base44.entities.BaitRecipe.delete(recipe.id);
      }
    } catch (e) {
      console.log('No recipes to delete or error deleting recipes:', e.message);
    }

    try {
      const licenses = await base44.entities.License.filter({ created_by: user.email });
      for (const license of licenses) {
        await base44.entities.License.delete(license.id);
      }
    } catch (e) {
      console.log('No licenses to delete or error deleting licenses:', e.message);
    }

    try {
      const messages = await base44.entities.ChatMessage.filter({ created_by: user.email });
      for (const msg of messages) {
        await base44.entities.ChatMessage.delete(msg.id);
      }
    } catch (e) {
      console.log('No messages to delete or error deleting messages:', e.message);
    }

    // Note: User deletion from the User entity cannot be done by the SDK
    // Admin must manually delete the user account from the dashboard

    return Response.json({ 
      success: true, 
      message: 'Account data deleted successfully. Please contact support to complete account removal.' 
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});