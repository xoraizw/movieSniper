import React from 'react';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-gray-700 p-6 rounded-lg text-center">
    <div className="text-yellow-500 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-yellow-500">{title}</h3>
    <p>{description}</p>
  </div>
);

export default FeatureCard;
