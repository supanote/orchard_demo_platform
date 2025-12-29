import React from 'react';
import type { Patient, Task } from '../types';

interface TasksTabProps {
  tasks: Task[];
  patients: Patient[];
  openPatientDetail: (patient: Patient, mode: string) => void;
}

const TasksTab: React.FC<TasksTabProps> = ({ tasks, patients, openPatientDetail }) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Action Required ({tasks.filter(t => !t.assignedTo).length})</h2>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Patient</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Stage</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Reason</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Priority</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Waiting</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{task.patientName}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${task.type === 'Escalated' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {task.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{task.stage}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{task.reason}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${task.priority === 'P1' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm ${task.slaStatus === 'breached' ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    {task.waitingSince}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => { 
                      const p = patients.find(x => x.id === task.patientId); 
                      if (p) openPatientDetail(p, 'panel'); 
                    }} 
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Open →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TasksTab;

