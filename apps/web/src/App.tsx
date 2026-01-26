import { useState } from 'react'
import logo from '/logo.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="/" target="_blank">
          <img src={logo} className="logo" alt="Hayl logo" />
        </a>
      </div>
      <h1>Hayl</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Welcome to Hayl - The Future of Fitness
      </p>
    </>
  )
}

export default App
