import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Gamepad2, Fish } from "lucide-react";
import PrecisionCast from "@/components/arcade/PrecisionCast";
import FishingGame from "@/components/arcade/FishingGame";
import FishingQuiz from "@/components/arcade/FishingQuiz";

export default function Arcade() {
  const [activeGame, setActiveGame] = useState(null);

  const games = [
    {
      id: 'precision-cast',
      name: 'Precision Cast',
      description: 'Triff die Zielscheibe so präzise wie möglich!',
      icon: '🎯',
      component: PrecisionCast
    },
    {
      id: 'fishing-game',
      name: '3D Angel-Simulator',
      description: 'Realistisches 3D-Angelspiel mit Physik!',
      icon: '🎣',
      component: FishingGame
    },
    {
      id: 'fishing-quiz',
      name: 'Angel-Quiz',
      description: '10 Fragen, 10 Sekunden pro Antwort - teste dein Wissen!',
      icon: '🧠',
      component: FishingQuiz
    }
  ];

  if (activeGame) {
    const GameComponent = activeGame.component;
    return (
      <div className="fixed inset-0 bg-gray-950 z-50">
        <Button
          onClick={() => setActiveGame(null)}
          className="absolute top-4 left-4 z-50 bg-gray-800/90 hover:bg-gray-700/90 backdrop-blur-sm"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>
        <GameComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 pb-32">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gamepad2 className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl font-bold text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]">
              Arcade
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Teste deine Angel-Skills in verschiedenen Mini-Games!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-morphism border-gray-800 hover:border-cyan-500/50 transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-5xl group-hover:scale-110 transition-transform">
                      {game.icon}
                    </div>
                  </div>
                  <CardTitle className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]">
                    {game.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4 min-h-[3rem]">
                    {game.description}
                  </p>
                  <Button
                    onClick={() => setActiveGame(game)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                  >
                    Spielen
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="glass-morphism border-cyan-500/30 bg-cyan-900/10 mt-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Fish className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-cyan-400 mb-1">Tipp für bessere Ergebnisse</p>
                <p>
                  In den Arcade-Spielen kannst du deine Angel-Fähigkeiten trainieren und verbessern. 
                  Deine Highscores werden gespeichert und du kannst dich mit anderen Anglern messen!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}