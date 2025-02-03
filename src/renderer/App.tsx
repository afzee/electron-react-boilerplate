import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import { TrainerScreen } from './TrainerScreen';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrainerScreen />} />
      </Routes>
    </Router>
  );
}
