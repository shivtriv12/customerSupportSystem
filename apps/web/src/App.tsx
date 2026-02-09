import { useEffect, useState } from 'react'
import { hc } from 'hono/client'
// Import the type from the API directly!
import type { AppType } from 'api' 

// Initialize the client
const client = hc<AppType>('http://localhost:3000')

function App() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    // This fetch is fully typed! 
    // If you typo '/hello', TypeScript will error.
    client.hello.$get().then(async (res) => {
      const data = await res.json()
      setMessage(data.message)
    })
  }, [])

  return (
    <div>
      <h1>Frontend + Backend</h1>
      <p>Server says: {message}</p>
    </div>
  )
}

export default App