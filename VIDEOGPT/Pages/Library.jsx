
import React, { useState, useEffect, useCallback } from "react";
import { VideoExplanation } from "@/entities/VideoExplanation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import ExplanationCard from "../components/library/ExplanationCard";
import VideoPlayer from "../components/generate/VideoPlayer";

export default function LibraryPage() {
  const navigate = useNavigate();
  const [explanations, setExplanations] = useState([]);
  const [filteredExplanations, setFilteredExplanations] = useState([]);
  const [selectedExplanation, setSelectedExplanation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [complexityFilter, setComplexityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExplanations();
  }, []);

  const loadExplanations = async () => {
    try {
      const data = await VideoExplanation.list("-created_date");
      setExplanations(data);
    } catch (error) {
      console.error("Failed to load explanations:", error);
    }
    setIsLoading(false);
  };

  const filterExplanations = useCallback(() => {
    let filtered = explanations;

    if (searchQuery) {
      filtered = filtered.filter(exp => 
        exp.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.script && exp.script.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(exp => exp.category === categoryFilter);
    }

    if (complexityFilter !== "all") {
      filtered = filtered.filter(exp => exp.complexity_level === complexityFilter);
    }

    setFilteredExplanations(filtered);
  }, [explanations, searchQuery, categoryFilter, complexityFilter]);

  useEffect(() => {
    filterExplanations();
  }, [filterExplanations]);

  const handleExplanationClick = async (explanation) => {
    // Increment view count
    await VideoExplanation.update(explanation.id, {
      view_count: (explanation.view_count || 0) + 1
    });
    
    // Update local state
    const updatedExplanation = { ...explanation, view_count: (explanation.view_count || 0) + 1 };
    setSelectedExplanation(updatedExplanation);
    // Reload all explanations to reflect new view count in the library list
    loadExplanations();
  };

  const goBackToLibrary = () => {
    setSelectedExplanation(null);
  };

  if (selectedExplanation) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <button
              onClick={goBackToLibrary}
              className="text-purple-300 hover:text-white transition-colors duration-200 flex items-center gap-2"
            >
              ← Back to Library
            </button>
          </div>
          <VideoPlayer explanation={selectedExplanation} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Your Video Library
          </h1>
          <p className="text-purple-300">Browse and revisit your AI-generated explanations</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search explanations..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 rounded-xl"
            />
          </div>
          
          <div className="flex gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">All Categories</SelectItem>
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

            <Select value={complexityFilter} onValueChange={setComplexityFilter}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filteredExplanations.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-purple-400 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl text-white font-semibold mb-2">
              {explanations.length === 0 ? "No explanations yet" : "No results found"}
            </h3>
            <p className="text-purple-300 mb-6">
              {explanations.length === 0 
                ? "Generate your first video explanation to get started"
                : "Try adjusting your search terms or filters"
              }
            </p>
            {explanations.length === 0 && (
              <button
                onClick={() => navigate(createPageUrl("Generate"))}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                Generate Your First Video
              </button>
            )}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AnimatePresence>
              {filteredExplanations.map((explanation, index) => (
                <motion.div
                  key={explanation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ExplanationCard
                    explanation={explanation}
                    onClick={() => handleExplanationClick(explanation)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
