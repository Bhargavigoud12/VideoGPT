
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

const suggestedTopics = [
  "How quantum computing works",
  "The science behind black holes", 
  "Blockchain technology explained",
  "Climate change solutions",
  "Artificial intelligence basics",
  "Human memory formation"
];

export default function TopicInput({ onGenerate, isGenerating, generationStatus }) {
  const [topic, setTopic] = useState("");
  const [complexity, setComplexity] = useState("beginner");
  const [category, setCategory] = useState("science");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate({ topic: topic.trim(), complexity, category });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full px-4 py-2 mb-4">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-purple-200 text-sm font-medium">AI-Powered Explanations</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What would you like to
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> learn</span>?
            </h1>
            <p className="text-purple-200 text-lg max-w-2xl mx-auto">
              Enter any topic and get an engaging video explanation powered by AI
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How does photosynthesis work?"
                className="h-16 text-lg bg-white/10 border-white/20 text-white placeholder:text-purple-300 rounded-2xl px-6"
              />
              <Lightbulb className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-purple-200 font-medium">Complexity Level</label>
                <Select value={complexity} onValueChange={setComplexity}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-purple-200 font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={!topic.trim() || isGenerating}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  {generationStatus || "Generating..."}
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Generate Video Explanation
                </>
              )}
            </Button>
          </form>

          <div className="mt-8">
            <p className="text-purple-300 text-sm mb-4 text-center">Suggested topics:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {suggestedTopics.map((suggestedTopic, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setTopic(suggestedTopic)}
                  className="bg-white/5 border-white/20 text-purple-200 hover:bg-white/10 hover:text-white rounded-full"
                >
                  {suggestedTopic}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
