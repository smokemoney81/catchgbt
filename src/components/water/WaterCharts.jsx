import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function WaterCharts({ data, type }) {
  const isHistory = type === "history";
  const title = isHistory ? "30-Tage Verlauf" : "7-Tage Prognose";

  return (
    <div className="space-y-6">
      
      {/* Fishing Score Chart */}
      <Card className="glass-morphism border-gray-800">
        <CardHeader>
          <CardTitle className="text-cyan-400">Fang-Score {isHistory ? "Verlauf" : "Prognose"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                 <linearGradient id="fishingScoreGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                   <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                 </linearGradient>
               </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#22d3ee' }}
              />
              <Area 
                type="monotone" 
                dataKey="fishingScore" 
                stroke="#0284c7" 
                fillOpacity={1} 
                fill="url(#fishingScoreGradient)"
                name="Fang-Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Temperature & Chlorophyll */}
      <Card className="glass-morphism border-gray-800">
        <CardHeader>
          <CardTitle className="text-cyan-400">Temperatur & Chlorophyll</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                label={{ value: '°C', position: 'insideLeft', fill: '#9ca3af' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                label={{ value: 'mg/m³', position: 'insideRight', fill: '#9ca3af' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#22d3ee' }}
              />
              <Legend wrapperStyle={{ color: '#9ca3af' }} />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="temperature" 
                stroke="#d97706" 
                strokeWidth={2}
                name="Temperatur (°C)"
                dot={{ fill: '#d97706' }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="chlorophyll" 
                stroke="#059669" 
                strokeWidth={2}
                name="Chlorophyll (mg/m³)"
                dot={{ fill: '#059669' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Turbidity & Oxygen (nur History) */}
      {isHistory && (
        <Card className="glass-morphism border-gray-800">
          <CardHeader>
            <CardTitle className="text-cyan-400">Trübung & Sauerstoff</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  label={{ value: 'NTU', position: 'insideLeft', fill: '#9ca3af' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  label={{ value: 'mg/L', position: 'insideRight', fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#22d3ee' }}
                />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="turbidity" 
                  stroke="#1e40af" 
                  strokeWidth={2}
                  name="Trübung (NTU)"
                  dot={{ fill: '#1e40af' }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="oxygen" 
                  stroke="#0369a1" 
                  strokeWidth={2}
                  name="Sauerstoff (mg/L)"
                  dot={{ fill: '#0369a1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Algae Bloom Risk (nur Forecast) */}
      {!isHistory && (
        <Card className="glass-morphism border-gray-800">
          <CardHeader>
            <CardTitle className="text-cyan-400">Algenblüte-Risiko Prognose</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                  <span className="text-gray-300">{item.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-white text-sm">
                      Chlorophyll: {item.chlorophyll.toFixed(1)} mg/m³
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.algaeBloomRisk === 'hoch' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      item.algaeBloomRisk === 'mittel' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      Risiko: {item.algaeBloomRisk.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}