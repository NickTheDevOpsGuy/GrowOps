// App.tsx (skeleton)
import { Routes, Route, Link } from 'react-router-dom';
import TaskGarden from './pages/TaskGarden';

export default function App() {
  return (
    <>
      <nav className='flex gap-3 p-3'>
        <Link to='/growops'>GrowOps</Link>
      </nav>

      <Routes>
        <Route path='/growops' element={<TaskGarden />} />
      </Routes>
    </>
  );
}
