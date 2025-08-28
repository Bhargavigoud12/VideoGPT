
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, BookOpen, Clock, Eye, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VideoPlayer({ explanation, onReplay }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef(null);
  const speechRef = useRef(window.speechSynthesis);

  // Cleanup speech on unmount
  useEffect(() => {
    const speech = speechRef.current;
    return () => {
      if (speech) {
        speech.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!explanation || !explanation.script) {
      setIsPlaying(false); // Ensure player is stopped if no script
      return;
    }

    if (isPlaying) {
      if (speechRef.current.paused && utteranceRef.current) {
        speechRef.current.resume();
      } else if (!speechRef.current.speaking) { // Only speak if not already speaking
        speechRef.current.cancel(); // Cancel any previous speech
        const utterance = new SpeechSynthesisUtterance(explanation.script);
        
        // Configure speech for better quality
        utterance.volume = isMuted ? 0 : 1;
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;
        
        // Find a good quality voice if available
        const voices = speechRef.current.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Microsoft') ||
          (voice.quality && voice.quality.toLowerCase() === 'high') ||
          (voice.lang && voice.lang.startsWith('en')) // Prioritize English voices if quality not specified
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            const charIndex = event.charIndex;
            const scriptLength = explanation.script.length;
            
            const currentProgress = (charIndex / scriptLength) * 100;
            setProgress(currentProgress);

            // Smoother transitions between points and images
            const totalPoints = explanation.key_points?.length || 1;
            const totalImages = explanation.image_urls?.length || 1;
            
            const pointIndex = Math.floor((currentProgress / 100) * totalPoints);
            const imageIndex = Math.floor((currentProgress / 100) * totalImages);
            
            setCurrentPoint(Math.min(pointIndex, totalPoints - 1));
            setCurrentImageIndex(Math.min(imageIndex, totalImages - 1));
          }
        };
        
        utterance.onend = () => {
          setIsPlaying(false);
          setProgress(100);
          setCurrentPoint((explanation.key_points?.length || 0) - 1); // Ensure last point is highlighted
          setCurrentImageIndex((explanation.image_urls?.length || 0) - 1); // Ensure last image is shown
        };
        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event.error);
          setIsPlaying(false);
        };
        
        utteranceRef.current = utterance;
        speechRef.current.speak(utterance);
      }
    } else {
      if (speechRef.current.speaking && !speechRef.current.paused) {
        speechRef.current.pause();
      }
    }
  }, [isPlaying, explanation, isMuted]); // Added isMuted to dependencies

  useEffect(() => {
    if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? 0 : 1;
    }
  }, [isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const replay = () => {
    if (speechRef.current.speaking) {
      speechRef.current.cancel();
    }
    setProgress(0);
    setCurrentPoint(0);
    setCurrentImageIndex(0);
    // Small delay to ensure clean restart
    setTimeout(() => {
      setIsPlaying(true);
    }, 100);
    onReplay?.();
  };

  if (!explanation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-white/10 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-white mb-2">
                {explanation.topic}
              </CardTitle>
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {explanation.category}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {explanation.complexity_level}
                </Badge>
                <div className="flex items-center gap-1 text-purple-300">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{Math.ceil(explanation.duration_estimate / 60)}min</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Enhanced Video Display Area */}
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 aspect-video flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {explanation.image_urls && explanation.image_urls.length > 0 ? (
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 1.05, rotateY: -10 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.95, rotateY: 10 }}
                  transition={{ 
                    duration: 0.8,
                    ease: "easeOut"
                  }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={explanation.image_urls[currentImageIndex]}
                    alt={`${explanation.topic} - visual ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center relative z-10"
                >
                  <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl text-white font-semibold">{explanation.topic}</h3>
                  <p className="text-purple-300">AI-Generated Explanation</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Play Overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  onClick={togglePlay}
                  size="lg"
                  className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 shadow-2xl"
                >
                  <motion.div
                    initial={false}
                    animate={{ scale: isPlaying ? 0.8 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </motion.div>
                </Button>
              </motion.div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="bg-black/50 backdrop-blur-sm rounded-full h-3 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full shadow-lg"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              
              {/* Current point indicator */}
              {explanation.key_points && explanation.key_points.length > 0 && (
                <motion.div 
                  className="text-center mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-white/90 text-sm font-medium bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                    Point {currentPoint + 1} of {explanation.key_points.length}: {explanation.key_points[currentPoint]}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <Button
                onClick={togglePlay}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                onClick={replay}
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Replay
              </Button>
              <Button
                onClick={() => setIsMuted(!isMuted)}
                variant="ghost"
                size="icon"
                className="text-purple-300 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <div className="ml-auto flex items-center gap-2 text-purple-300">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{explanation.view_count} views</span>
              </div>
            </div>
          </div>

          {/* Enhanced Key Points */}
          <div className="p-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Key Learning Points
            </h4>
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {explanation.key_points && explanation.key_points.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0.5, x: -10 }}
                    animate={{ 
                      opacity: index <= currentPoint ? 1 : 0.6,
                      x: index === currentPoint ? 0 : -10,
                      scale: index === currentPoint ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`p-4 rounded-xl transition-all duration-500 ${
                      index <= currentPoint 
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg' 
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index <= currentPoint 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                            : 'bg-white/10 text-purple-300'
                        }`}
                        animate={index === currentPoint ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                        transition={{ duration: 0.6, repeat: index === currentPoint ? Infinity : 0, repeatDelay: 2 }}
                      >
                        {index + 1}
                      </motion.div>
                      <p className={`${
                        index <= currentPoint ? 'text-white' : 'text-purple-300'
                      } leading-relaxed`}>
                        {point}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Script Preview */}
          <div className="p-6 border-t border-white/10">
            <h4 className="text-white font-semibold mb-4">Full Explanation Script</h4>
            <div className="bg-white/5 rounded-xl p-4 max-h-48 overflow-y-auto">
              <p className="text-purple-200 leading-relaxed">
                {explanation.script}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
