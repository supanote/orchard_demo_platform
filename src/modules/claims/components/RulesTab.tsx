import React, { useMemo, useState } from 'react';
import { useClaims } from '../ClaimsProvider';

type NewRule = {
  name: string;
  description: string;
};

export const RulesTab: React.FC = () => {
  const {
    data: { rules },
    actions: { addRule, removeRule },
  } = useClaims();

  const [newRule, setNewRule] = useState<NewRule>({ name: '', description: '' });

  const disableAdd = useMemo(
    () => newRule.name.trim().length === 0 || newRule.description.trim().length === 0,
    [newRule],
  );

  const handleAddRule = () => {
    if (disableAdd) return;
    addRule(newRule.name, newRule.description);
    setNewRule({ name: '', description: '' });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Charge Review Rules</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage practice rules for charge review. New rules immediately influence AI suggestions.
            </p>
          </div>
          <div className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg">{rules.length} rules</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Add a rule</h3>
              <p className="text-xs text-gray-500">Rules are local to this session only and used by AI suggestions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Rule name</label>
              <input
                value={newRule.name}
                onChange={(e) => setNewRule((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Require telehealth modifier"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900"
              />
            </div>
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-medium text-gray-700">Description</label>
              <input
                value={newRule.description}
                onChange={(e) => setNewRule((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Short note on the condition or action"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <p>
              Tip: For the demo, add “ICD-10 Sequencing” to trigger the new sequencing suggestion.
            </p>
            <button
              onClick={() =>
                setNewRule({
                  name: 'ICD-10 Sequencing',
                  description: 'Primary diagnosis must be sequenced first based on clinical acuity.',
                })
              }
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Prefill demo rule
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAddRule}
              disabled={disableAdd}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Add Rule
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Rule list</h3>
            <p className="text-xs text-gray-500">Remove rules that no longer apply.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <span>{rule.name}</span>
                        <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 rounded-full">
                          Active
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{rule.description}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => removeRule(rule.id)}
                        className="text-sm text-gray-600 hover:text-red-600 font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}

                {rules.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500 space-y-2">
                      <p>No rules added yet.</p>
                      <p className="text-xs">Add a rule above to influence AI suggestions immediately.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};


