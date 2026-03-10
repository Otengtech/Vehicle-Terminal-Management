import React from 'react';
import Card, { CardHeader, CardBody } from '@components/Common/Card';

const Chart = ({ title, type = 'bar', data = [], height = 300 }) => {
  // Simple placeholder chart - you can replace with Recharts later
  const maxValue = Math.max(...data.map(d => d.value), 10);

  return (
    <Card>
      {title && (
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        </CardHeader>
      )}
      <CardBody>
        <div style={{ height: `${height}px` }} className="relative">
          <div className="absolute inset-0 flex items-end justify-around">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col items-center w-16">
                <div className="w-full bg-primary-100 dark:bg-primary-900/30 rounded-t-lg overflow-hidden">
                  <div 
                    className="bg-primary-600 dark:bg-primary-500 transition-all duration-500"
                    style={{ 
                      height: `${(item.value / maxValue) * (height - 60)}px`,
                      width: '100%'
                    }}
                  />
                </div>
                <span className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate w-full text-center">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default Chart;