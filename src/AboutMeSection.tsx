import React from 'react';
import { User } from 'lucide-react';

const AboutMeSection: React.FC = () => (
  <section id="about-me" className="bg-gray-800 py-20">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12 text-yellow-500 flex items-center justify-center">
        <User className="mr-2" /> About Me
      </h2>
      <div className="text-center">
        <p className="text-xl mb-8">
          I'm an AI enthusiast and movie lover, on a mission to make movie discovery easier with the power of AI.
        </p>
      </div>
    </div>
  </section>
);

export default AboutMeSection;
