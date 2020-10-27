import React from 'react'
import { Link } from 'react-router-dom'

import './Home.sass'

function Home() {
  return (
    <div className="home-container">
      <Link to="/game">Jogo</Link>
    </div>
  )
}

export default Home
