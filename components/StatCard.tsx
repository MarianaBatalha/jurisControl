import React from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string;
  subtext: string;
  // FIX: Update type to allow passing className prop via cloneElement
  icon: React.ReactElement<{ className?: string }>;
  iconBgColor: string;
  iconColor: string;
  // FIX: Update type to allow passing className prop via cloneElement
  trendIcon: React.ReactElement<{ className?: string }>;
  trendIconColor?: string;
  to?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, icon, iconBgColor, iconColor, trendIcon, trendIconColor = 'text-green-500', to }) => {
  const content = (
    <div className="bg-white p-5 rounded-xl shadow-sm flex-1 h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-brand-gray-500 uppercase">{title}</p>
            <p className="text-3xl font-bold text-brand-gray-800 mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${iconBgColor}`}>
            {React.cloneElement(icon, { className: `w-6 h-6 ${iconColor}` })}
          </div>
        </div>
      </div>
      <div className="flex items-center text-sm text-brand-gray-500 mt-4">
        {React.cloneElement(trendIcon, { className: `w-4 h-4 mr-1 ${trendIconColor}` })}
        <span>{subtext}</span>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="block transition-transform duration-200 hover:-translate-y-1">{content}</Link>;
  }

  return content;
};

export default StatCard;