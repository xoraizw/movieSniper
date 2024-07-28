import React from 'react';
import './Slider.css'; // Import custom styles for the slider

interface CustomSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const CustomSlider: React.FC<CustomSliderProps> = ({ value, onChange, min = 0, max = 3, step = 1 }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    onChange(newValue);
  };

  return (
    <div className="custom-slider">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="slider-input"
      />
      
    </div>
  );
};
{/* <div className="slider-labels">
        {/* <span>-3 (Low)</span> */}
        // <span>Neutral</span>
        // <span>High</span>
      // </div> */}

export default CustomSlider;
