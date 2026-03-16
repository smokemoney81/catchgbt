import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";

export default function ChatWidget({ topic = "Allgemein" }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        console.log("User not authenticated");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
        if (event.type === 'create' && event.data?.context === topic) {
          setMessages(prev => [...prev, event.data]);
        }
      });
      return unsubscribe;
    }
  }, [isOpen, topic]);

  const loadMessages = async () => {
    try {
      const data = await base44.entities.ChatMessage.filter({ context: topic }, '-timestamp', 30);
      setMessages(data);
    } catch (e) {
      console.error("Error loading messages:", e);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    try {
      await base44.entities.ChatMessage.create({
        role: "user",
        content: newMessage,
        context: topic,
        timestamp: new Date().toISOString()
      });
      setNewMessage("");
    } catch (e) {
      console.error("Error sending message:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-slate-700 hover:bg-slate-800">
          <MessageCircle className="w-4 h-4" />
          Chat: {topic}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Chat - {topic}</DialogTitle>
        </DialogHeader>
        
        <div className="h-80 overflow-y-auto space-y-3 mb-4 bg-slate-950 rounded p-3">
          {messages.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Keine Nachrichten</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`text-sm p-2 rounded ${
                  msg.created_by === user?.email
                    ? "bg-cyan-900 text-cyan-100 ml-4"
                    : "bg-slate-800 text-slate-200 mr-4"
                }`}
              >
                <p className="text-xs opacity-75 mb-1">{msg.created_by}</p>
                <p>{msg.content}</p>
              </div>
            ))
          )}
        </div>

        {user && (
          <div className="flex gap-2">
            <Input
              placeholder="Nachricht schreiben..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="bg-slate-800 border-slate-700 text-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading}
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              Senden
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}