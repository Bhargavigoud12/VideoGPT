
import React, { useState } from "react";
import { VideoExplanation } from "@/entities/VideoExplanation";
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import TopicInput from "../components/generate/TopicInput";
import VideoPlayer from "../components/generate/VideoPlayer";

export default function GeneratePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [currentExplanation, setCurrentExplanation] = useState(null);
  const [error, setError] = useState(null);

  const generateExplanation = async ({ topic, complexity, category }) => {
    setIsGenerating(true);
    setError(null);

    try {
      setGenerationStatus("Generating script...");
      const response = await InvokeLLM({
        prompt: `Create a direct, focused explanation for the topic: "${topic}". 
        
        Complexity level: ${complexity}
        Category: ${category}
        
        IMPORTANT GUIDELINES:
        - Start directly with the topic explanation - NO generic introductions like "welcome to the channel", "today we'll discuss", etc.
        - Begin immediately with engaging content about the topic
        - Use a conversational, educational tone as if explaining to a friend
        - Structure the content in clear, logical segments that flow naturally
        - Include specific examples, analogies, and real-world applications
        - Make it engaging but educational, not promotional
        - Aim for 2-4 minutes of natural speaking content
        - End with a clear, satisfying conclusion that reinforces key learnings
        
        The explanation should feel like a focused educational segment, not a YouTube video intro.
        
        Please provide:
        1. A comprehensive script that flows naturally from concept to concept
        2. Key learning points (4-6 main concepts, keep them concise and specific)
        3. Estimated duration in seconds based on natural speaking pace`,
        response_json_schema: {
          type: "object",
          properties: {
            script: { type: "string" },
            key_points: { type: "array", items: { type: "string" } },
            duration_estimate: { type: "number" }
          }
        }
      });

      const keyPoints = response.key_points || [];
      const imageUrls = [];

      for (let i = 0; i < keyPoints.length; i++) {
        setGenerationStatus(`Generating visual ${i + 1}/${keyPoints.length}...`);
        const imageResponse = await GenerateImage({
          prompt: `Professional educational illustration for "${keyPoints[i]}" related to "${topic}". Style: clean, modern, informative, high-quality diagram or visualization. No text overlays. Focus on visual clarity and educational value. Professional documentary style.`
        });
        imageUrls.push(imageResponse.url);
      }

      setGenerationStatus("Saving explanation...");
      const explanation = await VideoExplanation.create({
        topic,
        category,
        complexity_level: complexity,
        script: response.script,
        key_points: keyPoints,
        duration_estimate: response.duration_estimate,
        image_urls: imageUrls,
        view_count: 1
      });

      setCurrentExplanation(explanation);
    } catch (err) {
      setError("Failed to generate explanation. Please try again.");
      console.error(err);
    }

    setIsGenerating(false);
    setGenerationStatus("");
  };

  const handleReplay = async () => {
    if (currentExplanation) {
      await VideoExplanation.update(currentExplanation.id, {
        view_count: (currentExplanation.view_count || 0) + 1
      });
    }
  };

  const startOver = () => {
    setCurrentExplanation(null);
    setError(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {!currentExplanation ? (
          <div className="flex items-center justify-center min-h-[80vh]">
            <TopicInput 
              onGenerate={generateExplanation}
              isGenerating={isGenerating}
              generationStatus={generationStatus}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <button
                onClick={startOver}
                className="text-purple-300 hover:text-white transition-colors duration-200 flex items-center gap-2"
              >
                ← Generate New Explanation
              </button>
            </div>
            <VideoPlayer 
              explanation={currentExplanation}
              onReplay={handleReplay}
            />
          </div>
        )}

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500/20 backdrop-blur-xl border border-red-500/30 text-red-200 p-4 rounded-xl">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
