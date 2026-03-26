import React from 'react';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`${color} p-3 rounded-lg mr-4`}>
          <div className="text-white text-xl">
            {icon}
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;