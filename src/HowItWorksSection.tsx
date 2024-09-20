import React from 'react';
import FeatureCard from './FeatureCard';
import { Film, Search, Sparkles, PenLine , Sliders, Brain, ShieldQuestion  } from 'lucide-react';

const HowItWorksSection: React.FC = () => (
  <section id="how-it-works" className="py-10 flex items-center">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12 text-yellow-500 flex items-center justify-center">
        <ShieldQuestion className="mr-2" /> How It Works?
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Search size={40} />}
          title="Search for a Movie"
          description="Start by searching for a movie you enjoy. This helps us understand your taste."
        />
        <FeatureCard
          icon={<Sliders size={40} />}
          title="Adjust Preferences"
          description="Use sliders to fine-tune the intensity of each genre you're interested in."
        />
        <FeatureCard
          icon={<PenLine size={40} />}
          title="Get Recommendations"
          description="Receive a list of movies tailored to your preferences and similar to your search."
        />
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
