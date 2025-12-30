import React, { useState, useEffect } from 'react';
import type { Patient } from '../types';

interface SettingsTabProps {
  apiPatient: Patient | null;
  onDeletePatient: () => Promise<void>;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ apiPatient, onDeletePatient }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [baseUrl, setBaseUrl] = useState('<YOUR_SERVER_URL>');

  // Get the actual origin on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDeletePatient();
    setIsDeleting(false);
    setShowConfirm(false);
  };

  return (
    <div className="p-4">
      
      {/* API Patient Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">API Patient Management</h3>
          <p className="text-xs text-gray-500 mt-1">Manage patients created via external API calls</p>
        </div>
        
        <div className="p-6">
          {apiPatient ? (
            <div className="space-y-4">
              {/* Patient Card */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {apiPatient.name?.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{apiPatient.name}</p>
                      <p className="text-sm text-gray-500">DOB: {apiPatient.dob}</p>
                      <p className="text-sm text-gray-500">Phone: {apiPatient.phone}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                    Active
                  </span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Insurance</p>
                    <p className="font-medium text-gray-900">{apiPatient.insurance}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Member ID</p>
                    <p className="font-medium text-gray-900">{apiPatient.memberId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Stage</p>
                    <p className="font-medium text-gray-900 capitalize">{apiPatient.stage}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Source</p>
                    <p className="font-medium text-gray-900 capitalize">{apiPatient.source}</p>
                  </div>
                </div>
              </div>
              
              {/* Delete Section */}
              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Patient
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-medium mb-3">
                    Are you sure you want to delete this patient from the intake workflow?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        'Yes, Delete'
                      )}
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      disabled={isDeleting}
                      className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">No API patient currently active</p>
              <p className="text-sm text-gray-400">
                Use the API to add a patient:
              </p>
              <code className="mt-2 inline-block px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 font-mono break-all">
                curl -X POST {baseUrl}/api/patient
              </code>
            </div>
          )}
        </div>
      </div>

      {/* API Documentation Section */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">API Reference</h3>
          <p className="text-xs text-gray-500 mt-1">External endpoints to manage intake patients</p>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Add Patient */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-emerald-50 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded">POST</span>
              <code className="text-sm text-gray-700">/api/patient</code>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-600 mb-2">Add John Smith to the intake workflow</p>
              <code className="block px-3 py-2 bg-gray-900 rounded text-sm text-emerald-400 font-mono break-all">
                curl -X POST {baseUrl}/api/patient
              </code>
            </div>
          </div>

          {/* Delete Patient */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-red-50 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">DELETE</span>
              <code className="text-sm text-gray-700">/api/patient</code>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-600 mb-2">Remove John Smith from the intake workflow</p>
              <code className="block px-3 py-2 bg-gray-900 rounded text-sm text-red-400 font-mono break-all">
                curl -X DELETE {baseUrl}/api/patient
              </code>
            </div>
          </div>

          {/* Get Status */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-blue-50 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">GET</span>
              <code className="text-sm text-gray-700">/api/patient</code>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-600 mb-2">Check if the API patient is active</p>
              <code className="block px-3 py-2 bg-gray-900 rounded text-sm text-blue-400 font-mono break-all">
                curl {baseUrl}/api/patient
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;

