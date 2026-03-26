import React from 'react';

const RoleCard = ({ 
  title, 
  description, 
  icon, 
  iconColor, 
  bgColor, 
  borderColor, 
  onClick 
}) => {
  return (
<button
  onClick={onClick}
  className={`
    ${bgColor} ${borderColor}
    border-2 rounded-2xl
    p-5 sm:p-6 md:p-8
    text-left
    transition-all duration-300
    hover:shadow-xl hover:-translate-y-1
    active:-translate-y-0.5
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    w-full h-full
  `}
>

      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className={`${iconColor} text-4xl sm:text-5xl mb-4 sm:mb-6`}>
          {icon}
        </div>
        
        {/* Title */}
       <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">  {/* Added transition-none */}
          {title}
        </h3>
        
        {/* Description */}
       <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">  {/* Added transition-none */}
          {description}
        </p>
        
        {/* Action Text */}
        <div className="mt-auto">
          <span className="inline-flex items-center text-blue-600 font-medium transition-none">  {/* Added transition-none */}
            Click to continue
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
};

export default RoleCard;