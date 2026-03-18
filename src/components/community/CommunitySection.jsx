import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useHaptic } from "@/components/utils/HapticFeedback";
import { useSound } from "@/components/utils/SoundManager";
import { ThumbsUp, MessageCircle, AlertTriangle, Send, Users, ExternalLink, Video, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CommunitySection() {
  const { triggerHaptic } = useHaptic();
  const { playSound } = useSound();
  
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ text: "", photo_url: "" });
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userCache, setUserCache] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      const allPosts = await base44.entities.Post.list('-created_date');
      setPosts(allPosts);

      // User-Daten für alle Post-Ersteller laden
      const uniqueEmails = [...new Set(allPosts.map(p => p.created_by))];
      const userPromises = uniqueEmails.map(async (email) => {
        try {
          const users = await base44.entities.User.filter({ email });
          return { email, user: users[0] || null };
        } catch (e) {
          return { email, user: null };
        }
      });
      
      const userResults = await Promise.all(userPromises);
      const cache = {};
      userResults.forEach(({ email, user }) => {
        cache[email] = user;
      });
      setUserCache(cache);

      // Kommentare laden
      const commentPromises = allPosts.map(post => 
        base44.entities.Comment.filter({ post_id: post.id })
      );
      const allComments = await Promise.all(commentPromises);
      
      // User-Daten für Kommentar-Ersteller laden
      const commentEmails = allComments.flat().map(c => c.created_by);
      const uniqueCommentEmails = [...new Set(commentEmails)].filter(e => !cache[e]);
      
      if (uniqueCommentEmails.length > 0) {
        const commentUserPromises = uniqueCommentEmails.map(async (email) => {
          try {
            const users = await base44.entities.User.filter({ email });
            return { email, user: users[0] || null };
          } catch (e) {
            return { email, user: null };
          }
        });
        
        const commentUserResults = await Promise.all(commentUserPromises);
        commentUserResults.forEach(({ email, user }) => {
          cache[email] = user;
        });
        setUserCache(cache);
      }
      
      const commentMap = {};
      allPosts.forEach((post, idx) => {
        commentMap[post.id] = allComments[idx] || [];
      });
      setComments(commentMap);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
      toast.error("Fehler beim Laden der Community-Daten");
    }
    setLoading(false);
  };

  const getUserDisplayName = (email) => {
    const user = userCache[email];
    if (user?.nickname) return user.nickname;
    if (user?.full_name) return user.full_name;
    return email?.split('@')[0] || 'Angler';
  };

  const getUserAvatar = (email) => {
    const user = userCache[email];
    if (user?.profile_picture_url) {
      return <img src={user.profile_picture_url} alt={`Avatar von ${getUserDisplayName(email)}`} loading="lazy" className="w-full h-full object-cover" />;
    }
    
    const name = getUserDisplayName(email);
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    return (
      <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
        <span className="text-white font-bold text-sm">{initials}</span>
      </div>
    );
  };

  const handleCreatePost = async () => {
    if (!newPost.text.trim()) {
      toast.warning("Bitte gib einen Text ein");
      return;
    }

    try {
      await base44.entities.Post.create({
        text: newPost.text,
        photo_url: newPost.photo_url || null
      });

      setNewPost({ text: "", photo_url: "" });
      await loadData();
      
      triggerHaptic('success');
      playSound('success');
      toast.success("Post erfolgreich erstellt!");
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
      toast.error("Fehler beim Erstellen des Posts");
      triggerHaptic('error');
      playSound('error');
    }
  };

  const handleLike = async (postId, currentLikes) => {
    // Optimistic update
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, likes: currentLikes + 1 } : p
    ));
    triggerHaptic('light');
    playSound('selection');

    try {
      await base44.entities.Post.update(postId, {
        likes: currentLikes + 1
      });
    } catch (error) {
      console.error("Fehler beim Liken:", error);
      // Revert on error
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, likes: currentLikes } : p
      ));
      toast.error("Fehler beim Liken");
    }
  };

  const handleComment = async (postId) => {
    const commentText = newComment[postId];
    if (!commentText?.trim()) {
      toast.warning("Bitte gib einen Kommentar ein");
      return;
    }

    // Optimistic update
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      post_id: postId,
      text: commentText,
      created_by: currentUser?.email,
      created_date: new Date().toISOString()
    };

    const updatedComments = {
      ...comments,
      [postId]: [...(comments[postId] || []), optimisticComment]
    };
    setComments(updatedComments);
    setNewComment({ ...newComment, [postId]: "" });
    triggerHaptic('light');
    playSound('click');

    try {
      const newCommentData = await base44.entities.Comment.create({
        post_id: postId,
        text: commentText
      });
      
      // Replace temp with real
      setComments({
        ...updatedComments,
        [postId]: updatedComments[postId].map(c => 
          c.id === optimisticComment.id ? newCommentData : c
        )
      });
    } catch (error) {
      console.error("Fehler beim Kommentieren:", error);
      // Revert on error
      setComments({
        ...comments,
        [postId]: (comments[postId] || []).filter(c => c.id !== optimisticComment.id)
      });
      setNewComment({ ...newComment, [postId]: commentText });
      toast.error("Fehler beim Kommentieren");
    }
  };

  const handleReport = async (postId) => {
    try {
      await base44.entities.Post.update(postId, { reported: true });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, reported: true } : p));
      triggerHaptic('medium');
      playSound('warning');
      toast.success("Post wurde gemeldet");
    } catch (error) {
      console.error("Fehler beim Melden:", error);
      toast.error("Fehler beim Melden");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-cyan-400 animate-spin text-2xl">⟳</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-cyan-400" />
        <div>
          <h2 className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
            Community
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Tausche dich mit anderen Anglern aus
          </p>
        </div>
      </div>

      {/* Prominente Community-Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Facebook-Gruppe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-morphism border-cyan-600/50 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 hover:from-cyan-900/30 hover:to-blue-900/30 transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">Facebook Community</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Tritt unserer Facebook-Gruppe bei und vernetze dich mit über 1000 Anglern!
                  </p>
                  <Button
                    onClick={() => {
                      window.open('https://www.facebook.com/groups/1198538665381040/?ref=share', '_blank');
                      triggerHaptic('medium');
                      playSound('click');
                    }}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Zur Facebook-Gruppe
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tutorial-Website */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-morphism border-emerald-600/50 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 hover:from-emerald-900/30 hover:to-teal-900/30 transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">Tutorials & Forum</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Lerne die App kennen und stelle Fragen im Forum!
                  </p>
                  <Button
                    onClick={() => {
                      window.open('https://catchgbt-q7scna.manus.space', '_blank');
                      triggerHaptic('medium');
                      playSound('click');
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Zu Tutorials & Forum
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Post erstellen */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-morphism border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-cyan-400" />
              Neuer Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Was möchtest du mit der Community teilen?"
              value={newPost.text}
              onChange={(e) => setNewPost({ ...newPost, text: e.target.value })}
              className="bg-gray-800/50 border-gray-700 text-white min-h-[100px]"
            />
            <Input
              placeholder="Bild-URL (optional)"
              value={newPost.photo_url}
              onChange={(e) => setNewPost({ ...newPost, photo_url: e.target.value })}
              className="bg-gray-800/50 border-gray-700 text-white"
            />
            <Button
              onClick={handleCreatePost}
              className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Post erstellen
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Posts */}
      <div className="space-y-6">
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-morphism border-gray-800">
                <CardContent className="p-6">
                  {/* Post Header mit User-Info */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-500/30 flex-shrink-0">
                      {getUserAvatar(post.created_by)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {getUserDisplayName(post.created_by)}
                        </span>
                        {post.created_by === currentUser?.email && (
                          <Badge variant="outline" className="text-xs bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
                            Du
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(post.created_date).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    {/* Report Button */}
                    {!post.reported && post.created_by !== currentUser?.email && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Post melden"
                        onClick={() => handleReport(post.id)}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <AlertTriangle aria-hidden="true" className="w-4 h-4" />
                      </Button>
                    )}
                    {post.reported && (
                      <Badge variant="outline" className="text-xs bg-red-600/20 text-red-400 border-red-500/30">
                        Gemeldet
                      </Badge>
                    )}
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-200 mb-4 whitespace-pre-wrap">{post.text}</p>
                  
                  {post.photo_url && (
                    <img
                      src={post.photo_url}
                      alt={`Post von ${getUserDisplayName(post.created_by)}`}
                      loading="lazy"
                      className="w-full rounded-lg mb-4 max-h-96 object-cover"
                    />
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id, post.likes || 0)}
                      className="text-gray-400 hover:text-cyan-400 flex items-center gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{post.likes || 0}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-emerald-400 flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{comments[post.id]?.length || 0}</span>
                    </Button>
                  </div>

                  {/* Comments */}
                  {comments[post.id] && comments[post.id].length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                      {comments[post.id].map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-700 flex-shrink-0">
                            {getUserAvatar(comment.created_by)}
                          </div>
                          <div className="flex-1 bg-gray-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-white">
                                {getUserDisplayName(comment.created_by)}
                              </span>
                              {comment.created_by === currentUser?.email && (
                                <Badge variant="outline" className="text-xs bg-cyan-600/20 text-cyan-400 border-cyan-500/30">
                                  Du
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-300">{comment.text}</p>
                            <span className="text-xs text-gray-500 mt-1 inline-block">
                              {new Date(comment.created_date).toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <div className="mt-4 flex gap-2">
                    <Input
                      placeholder="Schreibe einen Kommentar..."
                      value={newComment[post.id] || ""}
                      onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleComment(post.id);
                        }
                      }}
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                    <Button
                     onClick={() => handleComment(post.id)}
                     size="icon"
                     aria-label="Kommentar senden"
                     className="bg-emerald-600 hover:bg-emerald-700 flex-shrink-0"
                    >
                     <Send aria-hidden="true" className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {posts.length === 0 && (
          <Card className="glass-morphism border-gray-800">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Noch keine Posts
              </h3>
              <p className="text-gray-500">
                Sei der Erste und teile etwas mit der Community!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}