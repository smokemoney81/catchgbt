import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Heart, MessageCircle, Send, Camera, AlertTriangle, User, Loader2, X, Globe, Facebook } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [commenting, setCommenting] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [userCache, setUserCache] = useState({});
  const [deletingPostId, setDeletingPostId] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    loadPosts();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Fehler beim Laden des Users:", error);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const postsData = await base44.entities.Post.list("-created_date", 50);
      
      const newCache = {};
      const allEmails = new Set();
      
      postsData.forEach(post => allEmails.add(post.created_by));
      
      for (const email of allEmails) {
        try {
          const allUsers = await base44.entities.User.list('', 1000);
          const foundUser = allUsers.find(u => u.email === email);
          
          if (foundUser) {
            newCache[email] = foundUser;
          } else {
            newCache[email] = {
              email: email,
              nickname: null,
              full_name: null,
              profile_picture_url: null
            };
          }
        } catch (err) {
          console.error("Fehler beim Laden des Users:", err);
          newCache[email] = {
            email: email,
            nickname: null,
            full_name: null,
            profile_picture_url: null
          };
        }
      }
      
      setUserCache(newCache);

      const postsWithComments = await Promise.all(
        postsData.map(async (post) => {
          try {
            const comments = await base44.entities.Comment.filter({ post_id: post.id });
            
            for (const comment of comments) {
              if (!newCache[comment.created_by]) {
                try {
                  const allUsers = await base44.entities.User.list('', 1000);
                  const foundUser = allUsers.find(u => u.email === comment.created_by);
                  
                  if (foundUser) {
                    newCache[comment.created_by] = foundUser;
                  } else {
                    newCache[comment.created_by] = {
                      email: comment.created_by,
                      nickname: null,
                      full_name: null,
                      profile_picture_url: null
                    };
                  }
                } catch (err) {
                  console.error("Fehler beim Laden des Comment-Users:", err);
                }
              }
            }
            
            return { ...post, comments };
          } catch (error) {
            console.error("Fehler beim Laden der Kommentare:", error);
            return { ...post, comments: [] };
          }
        })
      );

      setPosts(postsWithComments);
    } catch (error) {
      console.error("Fehler beim Laden der Posts:", error);
      toast.error("Posts konnten nicht geladen werden");
    }
    setLoading(false);
  };

  const getUserDisplayName = (email) => {
    const user = userCache[email];
    if (!user) {
      const emailUsername = email.split('@')[0];
      return emailUsername || "Unbekannt";
    }
    
    if (user.full_name && user.full_name.trim() !== '') {
      return user.full_name.trim();
    }
    if (user.nickname && user.nickname.trim() !== '') {
      return user.nickname.trim();
    }
    
    const emailUsername = email.split('@')[0];
    return emailUsername || "Angler";
  };

  const getUserProfilePicture = (email) => {
    const user = userCache[email];
    if (!user) return null;
    return user.profile_picture_url || null;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Bild ist zu groß (max 5MB)");
      return;
    }

    setNewPostImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim() && !newPostImage) {
      toast.error("Bitte Text oder Bild hinzufügen");
      return;
    }

    setUploading(true);
    let photoUrl = null;
    
    try {
      // FIXIERT: Nutze base44.integrations.Core.UploadFile statt dynamischen Import
      if (newPostImage) {
        toast.info("Lade Bild hoch...");
        
        const response = await base44.integrations.Core.UploadFile({ file: newPostImage });
        photoUrl = response.file_url;
        
        toast.success("Bild hochgeladen!");
      }

      toast.info("Erstelle Post...");
      await base44.entities.Post.create({
        text: newPostText.trim(),
        photo_url: photoUrl,
        likes: 0,
        reported: false
      });

      setNewPostText("");
      setNewPostImage(null);
      setImagePreview(null);
      toast.success("Post erstellt! 🎣");
      await loadPosts();
    } catch (error) {
      console.error("Fehler beim Erstellen des Posts:", error);
      toast.error("Fehler: " + (error.message || "Post konnte nicht erstellt werden"));
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (postId, currentLikes) => {
    try {
      await base44.entities.Post.update(postId, { likes: currentLikes + 1 });
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, likes: currentLikes + 1 } : p
      ));
      toast.success("👍 Geliked!");
    } catch (error) {
      console.error("Fehler beim Liken:", error);
      toast.error("Like fehlgeschlagen");
    }
  };

  const handleComment = async (postId) => {
    if (!commentText.trim()) {
      toast.error("Kommentar darf nicht leer sein");
      return;
    }

    try {
      await base44.entities.Comment.create({
        post_id: postId,
        text: commentText.trim()
      });
      
      setCommentText("");
      setCommenting(null);
      toast.success("Kommentar hinzugefügt! 💬");
      await loadPosts();
    } catch (error) {
      console.error("Fehler beim Kommentieren:", error);
      toast.error("Kommentar fehlgeschlagen");
    }
  };

  const handleReport = async (postId) => {
    try {
      await base44.entities.Post.update(postId, { reported: true });
      toast.success("Post gemeldet");
      await loadPosts();
    } catch (error) {
      console.error("Fehler beim Melden:", error);
      toast.error("Melden fehlgeschlagen");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Post wirklich löschen?")) return;

    setDeletingPostId(postId);
    try {
      await base44.entities.Post.delete(postId);
      toast.success("Post gelöscht");
      await loadPosts();
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      toast.error("Löschen fehlgeschlagen");
    } finally {
      setDeletingPostId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Lade Community...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto p-6 space-y-8 pb-32">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]">
              Community
            </h1>
            <p className="text-gray-400 mt-1">Tausche dich mit anderen Anglern aus</p>
          </div>
        </div>

        {/* Externe Links Sektion */}
        <Card className="glass-morphism border-cyan-600/30 bg-gradient-to-br from-cyan-900/10 to-blue-900/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)] flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Finde uns online!
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <a 
              href="https://www.facebook.com/profile.php?id=61571109995877" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
                <Facebook className="w-4 h-4" />
                Unsere Facebook-Seite
              </Button>
            </a>
            <a 
              href="https://catchgbt-q7scna.manus.space" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2">
                <Globe className="w-4 h-4" />
                Zur Webseite
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Neuer Post */}
        <Card className="glass-morphism border-gray-800">
          <CardHeader>
            <h3 className="text-lg font-semibold text-cyan-400">Neuer Post</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="Was möchtest du teilen?"
              className="bg-gray-800/50 border-gray-700 text-white min-h-[100px]"
              disabled={uploading}
            />

            {imagePreview && (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full rounded-lg max-h-64 object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setNewPostImage(null);
                    setImagePreview(null);
                  }}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="post-image-upload"
                onChange={handleImageSelect}
                disabled={uploading}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("post-image-upload").click()}
                disabled={uploading}
                className="flex-1 border-gray-700 text-gray-300"
              >
                <Camera className="w-4 h-4 mr-2" />
                {newPostImage ? "Bild ändern" : "Bild hinzufügen"}
              </Button>
              
              <Button
                onClick={handleCreatePost}
                disabled={uploading || (!newPostText.trim() && !newPostImage)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird hochgeladen...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Posten
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <AnimatePresence>
          {posts.map((post) => {
            const profilePic = getUserProfilePicture(post.created_by);
            const displayName = getUserDisplayName(post.created_by);
            const isOwnPost = currentUser && post.created_by === currentUser.email;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="glass-morphism border-gray-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {profilePic ? (
                          <img 
                            src={profilePic} 
                            alt={displayName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center border-2 border-emerald-400">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white">{displayName}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(post.created_date).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {isOwnPost && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletingPostId === post.id}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          {deletingPostId === post.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-200 whitespace-pre-wrap">{post.text}</p>
                    
                    {post.photo_url && (
                      <img 
                        src={post.photo_url} 
                        alt="Post" 
                        className="w-full rounded-lg max-h-96 object-cover"
                      />
                    )}

                    <div className="flex items-center gap-4 pt-2 border-t border-gray-800">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id, post.likes || 0)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        {post.likes || 0}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCommenting(commenting === post.id ? null : post.id)}
                        className="text-gray-400 hover:text-cyan-400"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {post.comments?.length || 0}
                      </Button>

                      {!isOwnPost && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReport(post.id)}
                          className="text-gray-400 hover:text-amber-400 ml-auto"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Kommentare */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-gray-800">
                        {post.comments.map((comment) => {
                          const commentProfilePic = getUserProfilePicture(comment.created_by);
                          const commentDisplayName = getUserDisplayName(comment.created_by);

                          return (
                            <div key={comment.id} className="flex gap-2">
                              {commentProfilePic ? (
                                <img 
                                  src={commentProfilePic} 
                                  alt={commentDisplayName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-white" />
                                </div>
                              )}
                              <div className="flex-1 bg-gray-800/50 rounded-lg p-2">
                                <p className="text-xs font-semibold text-emerald-400 mb-1">
                                  {commentDisplayName}
                                </p>
                                <p className="text-sm text-gray-300">{comment.text}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Kommentar-Eingabe */}
                    {commenting === post.id && (
                      <div className="flex gap-2 pt-2">
                        <Input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Dein Kommentar..."
                          className="bg-gray-800/50 border-gray-700 text-white"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleComment(post.id);
                            }
                          }}
                        />
                        <Button
                          onClick={() => handleComment(post.id)}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {posts.length === 0 && (
          <Card className="glass-morphism border-gray-800">
            <CardContent className="text-center py-12">
              <p className="text-gray-400 mb-4">Noch keine Posts vorhanden</p>
              <p className="text-sm text-gray-500">Sei der Erste und teile deinen Fang! 🎣</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}