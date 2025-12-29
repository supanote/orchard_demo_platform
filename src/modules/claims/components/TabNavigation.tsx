import React from 'react';
import { useClaims } from '../ClaimsProvider';

export const TabNavigation: React.FC = () => {
  const {
    state: { activeTab },
    actions: { setActiveTab },
    data: { tasks },
  } = useClaims();

  const tabs: { id: 'summary' | 'workflow' | 'tasks'; label: string; badge?: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'tasks', label: 'Tasks', badge: String(tasks.length) },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.badge && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

