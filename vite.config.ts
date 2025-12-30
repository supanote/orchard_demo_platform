import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'

// In-memory state for the API patient
let apiPatientAdded = false

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'intake-patient-api',
      configureServer(server) {
        // API endpoint for managing the patient
        server.middlewares.use('/api/patient', (req: IncomingMessage, res: ServerResponse) => {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
          
          // Handle CORS preflight
          if (req.method === 'OPTIONS') {
            res.statusCode = 200
            res.end()
            return
          }
          
          if (req.method === 'POST') {
            // Add patient
            apiPatientAdded = true
            console.log('✅ API: John Smith patient ADDED')
            res.end(JSON.stringify({ 
              success: true, 
              patientAdded: true,
              message: 'John Smith added to intake workflow'
            }))
          } else if (req.method === 'DELETE') {
            // Remove patient
            apiPatientAdded = false
            console.log('🗑️ API: John Smith patient REMOVED')
            res.end(JSON.stringify({ 
              success: true, 
              patientAdded: false,
              message: 'John Smith removed from intake workflow'
            }))
          } else {
            // GET - Check status
            res.end(JSON.stringify({ 
              patientAdded: apiPatientAdded 
            }))
          }
        })
        
        console.log('\n📡 Intake Patient API ready:')
        console.log('   POST   http://localhost:5173/api/patient  - Add John Smith')
        console.log('   DELETE http://localhost:5173/api/patient  - Remove John Smith')
        console.log('   GET    http://localhost:5173/api/patient  - Check status\n')
      },
    },
  ],
})
