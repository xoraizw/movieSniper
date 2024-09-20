import { Search } from 'lucide-react'; // Ensure you have this icon imported

const StepCard: React.FC<{ number: number; title: string; description: string }> = ({ number, title, description }) => (
  <div className="bg-gray-700 p-6 rounded-lg text-center">
    <div className="text-4xl font-bold mb-4 text-yellow-500">{number}</div>
    <div className="flex justify-center items-center mb-2">
      <Search className="mr-2 text-yellow-500 w-6 h-6" /> {/* Adjusted icon size and color */}
      <h3 className="text-2xl font-semibold text-yellow-500">{title}</h3> {/* Increased font size */}
    </div>
    <p className="text-base text-gray-300">{description}</p> {/* Adjusted font color for readability */}
  </div>
);

export default StepCard;
