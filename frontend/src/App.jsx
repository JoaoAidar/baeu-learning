import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Lessons from './pages/Lessons';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/lessons" element={<Lessons />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
