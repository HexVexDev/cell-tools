import logo from './svgIcons/celula.jpg';
import ImageCluster from './components/ImageCluster.js';
import StatisticalAnalysis from './components/StatisticalAnalysis.js';
import Home from './components/Home.js';

import "./styles/mainStyles.css"

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link
} from 'react-router-dom';

function App() {
  return (
    <Router>
      <Toolbar />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/tool1" element={<ImageCluster />} />
        <Route path="/tool2" element={<StatisticalAnalysis />} />
        {/* Add more tools here */}
      </Routes>
    </Router>
  );
}
export default App

function Toolbar() {
  return (
    <nav className='main-bar'>
      <img src={logo} width='56px' height='44px'/>
      <Link to="/" className='button'>Home</Link>
      <Link to="/tool1" className='button'>Color Extraction</Link>
      <Link to="/tool2" className='button'>Cluster Statistics</Link>
    </nav>
  );
}