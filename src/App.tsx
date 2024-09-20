import LandingPage from './LandingPage';
function App() {  
  return (
    <>
      <LandingPage />
    </>
  );
}

export default App;
// import React, { useState, useEffect } from 'react';
// import { Search, Film, Sliders, ThumbsUp, Zap, Sparkles, Brain, User } from 'lucide-react';

// const LandingPage: React.FC = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [offset, setOffset] = useState(0);

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('Searching for:', searchQuery);
//   };

//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       setOffset((prevOffset) => (prevOffset + 1) % 200);
//     }, 50);

//     return () => clearInterval(intervalId);
//   }, []);

//   const popularMovies = [
//     "The Godfather", "Pulp Fiction", "The Shawshank Redemption", "The Dark Knight",
//     "Forrest Gump", "Inception", "The Matrix", "Goodfellas", "Fight Club",
//     "Star Wars", "Jurassic Park", "The Lord of the Rings", "Titanic", "Avatar"
//   ];

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       {/* Header */}
//       <header className="container mx-auto px-4 py-6 flex justify-between items-center">
//         <div className="text-2xl font-bold text-yellow-500">MovieSniper</div>
//         <nav>
//           <ul className="flex space-x-4">
//             <li><a href="#features" className="hover:text-yellow-500">Features</a></li>
//             <li><a href="#how-it-works" className="hover:text-yellow-500">How It Works</a></li>
//             <li><a href="#about-me" className="hover:text-yellow-500">About Me</a></li>
//           </ul>
//         </nav>
//       </header>

//       {/* Hero Section with Moving Background */}
//       <section className="relative py-20 overflow-hidden">
//         <div 
//           className="absolute inset-0 flex flex-wrap content-start opacity-10"
//           style={{
//             transform: `translateY(-${offset}px)`,
//             transition: 'transform 50ms linear',
//           }}
//         >
//           {[...Array(10)].map((_, i) => (
//             <div key={i} className="w-full whitespace-nowrap">
//               {popularMovies.map((movie, index) => (
//                 <span key={index} className="inline-block mx-4 text-3xl font-bold">{movie}</span>
//               ))}
//             </div>
//           ))}
//         </div>
//         <div className="container mx-auto px-4 text-center relative z-10">
//           <h1 className="text-5xl font-bold mb-6">Discover Your Next Favorite Movie</h1>
//           <p className="text-xl mb-8">MovieSniper uses advanced AI to recommend movies tailored just for you.</p>
//           <form onSubmit={handleSearch} className="max-w-xl mx-auto">
//             <div className="flex rounded-full overflow-hidden bg-white">
//               <input
//                 type="text"
//                 placeholder="Search for a movie you like..."
//                 className="flex-grow px-6 py-3 text-gray-800 focus:outline-none"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//               <button type="submit" className="bg-yellow-500 px-6 py-3 hover:bg-yellow-600 transition duration-300">
//                 <Search size={24} className="text-gray-900" />
//               </button>
//             </div>
//           </form>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="bg-gray-800 py-20">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold text-center mb-12 text-yellow-500 flex items-center justify-center">
//             <Zap className="mr-2" /> Why Choose MovieSniper?
//           </h2>
//           <div className="grid md:grid-cols-3 gap-8">
//             <FeatureCard
//               icon={<Sparkles size={40} />}
//               title="Vast Movie Database"
//               description="Access recommendations from our extensive collection of films across all genres."
//             />
//             <FeatureCard
//               icon={<Sliders size={40} />}
//               title="Customizable Preferences"
//               description="Fine-tune your genre preferences to get perfectly tailored recommendations."
//             />
//             <FeatureCard
//               icon={<Brain size={40} />}
//               title="AI-Powered Rankings"
//               description="Our LLM technology ranks movies based on multiple factors for accurate suggestions."
//             />
//           </div>
//         </div>
//       </section>

//       {/* How It Works Section */}
//       <section id="how-it-works" className="py-20">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold text-center mb-12 text-yellow-500 flex items-center justify-center">
//             <Film className="mr-2" /> How It Works
//           </h2>
//           <div className="grid md:grid-cols-3 gap-8">
//             <StepCard
//               number={1}
//               title="Search for a Movie"
//               description="Start by searching for a movie you enjoy. This helps us understand your taste."
//             />
//             <StepCard
//               number={2}
//               title="Adjust Preferences"
//               description="Use sliders to fine-tune the intensity of each genre you're interested in."
//             />
//             <StepCard
//               number={3}
//               title="Get Recommendations"
//               description="Receive a list of movies tailored to your preferences and similar to your search."
//             />
//           </div>
//         </div>
//       </section>

//       {/* About Me Section */}
//       <section id="about-me" className="bg-gray-800 py-20">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold text-center mb-12 text-yellow-500 flex items-center justify-center">
//             <User className="mr-2" /> About Me
//           </h2>
//           <div className="max-w-2xl mx-auto text-center">
//             <p className="text-lg mb-6">
//               Hello! I'm [Your Name], the creator of MovieSniper. As a passionate film enthusiast and AI developer, 
//               I've combined my love for cinema with cutting-edge technology to bring you personalized movie 
//               recommendations like never before.
//             </p>
//             <p className="text-lg mb-6">
//               With years of experience in [relevant fields, e.g., machine learning, data science, film studies], 
//               I've developed MovieSniper to help fellow movie lovers discover hidden gems and reconnect with their 
//               favorite genres. My goal is to make every movie night an unforgettable experience.
//             </p>
//             <p className="text-lg">
//               When I'm not working on improving MovieSniper, you can find me [your hobbies or interests, e.g., 
//               attending film festivals, discussing classic movies, or exploring new AI technologies].
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="bg-yellow-500 py-20">
//         <div className="container mx-auto px-4 text-center">
//           <h2 className="text-3xl font-bold mb-6 text-gray-900">Ready to Find Your Next Favorite Movie?</h2>
//           <a href="#" className="inline-block bg-gray-900 text-yellow-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition duration-300">
//             Get Started
//           </a>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-gray-800 py-6">
//         <div className="container mx-auto px-4 text-center">
//           <p>&copy; 2024 MovieSniper. All rights reserved.</p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
//   <div className="bg-gray-700 p-6 rounded-lg text-center">
//     <div className="text-yellow-500 mb-4">{icon}</div>
//     <h3 className="text-xl font-semibold mb-2 text-yellow-500">{title}</h3>
//     <p>{description}</p>
//   </div>
// );

// const StepCard: React.FC<{ number: number; title: string; description: string }> = ({ number, title, description }) => (
//   <div className="bg-gray-700 p-6 rounded-lg text-center">
//     <div className="text-4xl font-bold mb-4 text-yellow-500">{number}</div>
//     <h3 className="text-xl font-semibold mb-2 text-yellow-500">{title}</h3>
//     <p>{description}</p>
//   </div>
// );

// export default LandingPage;