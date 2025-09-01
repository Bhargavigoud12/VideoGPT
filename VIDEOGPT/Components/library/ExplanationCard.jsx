
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function ExplanationCard({ explanation, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group overflow-hidden"
        onClick={onClick}
      >
        <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
          {explanation.image_urls && explanation.image_urls.length > 0 ? (
            <img 
              src={explanation.image_urls[0]} 
              alt={explanation.topic}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-purple-400" />
            </div>
          )}
          
          {/* Duration overlay */}
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1 text-xs text-white">
            {Math.ceil(explanation.duration_estimate / 60)}min
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors duration-200">
            {explanation.topic}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
              {explanation.category}
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
              {explanation.complexity_level}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm text-purple-300">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{explanation.view_count} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{explanation.key_points?.length || 0} points</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
