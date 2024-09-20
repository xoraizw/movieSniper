import React from 'react';
import { Sparkles, Sliders, Brain } from 'lucide-react';
import FeatureCard from './FeatureCard.tsx';

const FeaturesSection: React.FC = () => (
  <section id="features" className="bg-gray-800 py-20 relative z-0">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12 text-yellow-500 flex items-center justify-center">
        <Sparkles className="mr-2" /> Why Choose MovieSniper?
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Sparkles size={40} />}
          title="Vast Movie Database"
          description="Access recommendations from our extensive collection of films across all genres."
        />
        <FeatureCard
          icon={<Sliders size={40} />}
          title="Customizable Preferences"
          description="Fine-tune your genre preferences to get perfectly tailored recommendations."
        />
        <FeatureCard
          icon={<Brain size={40} />}
          title="AI-Powered Rankings"
          description="Our LLM technology ranks movies based on multiple factors for accurate suggestions."
        />
      </div>
    </div>
  </section>
);

export default FeaturesSection;