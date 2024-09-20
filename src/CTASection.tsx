import React from 'react';

const CTASection: React.FC = () => (
  <section className="bg-yellow-500 py-20">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-4xl font-bold mb-6">Ready to Discover Your Next Favorite Movie?</h2>
      <p className="text-xl mb-8">Start your journey with MovieSniper!</p>
      <a href="#" className="bg-gray-900 text-yellow-500 px-6 py-3 rounded-full hover:bg-gray-700 transition duration-300">Give it a try!</a>
    </div>
  </section>
);

export default CTASection;
