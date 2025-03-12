// frontend/src/pages/Home.tsx
import React from 'react';
import { Card } from '../components/shared/Card';
import Button from '../components/shared/Button';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome to ChimeraStack</h1>
      
      <Card className="mb-8">
        <h2 className="text-xl font-bold mb-4">Simplify Your Development Environment</h2>
        <p className="mb-6">ChimeraStack helps you quickly set up development environments using pre-configured templates. No more wasting time with complex configurations!</p>
        
        <div className="flex flex-wrap gap-4">
          <Link to="/download-cli">
            <Button variant="primary">Download CLI</Button>
          </Link>
          <Link to="/templates">
            <Button variant="secondary">Explore Templates</Button>
          </Link>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold mb-2">For Developers</h3>
          <p className="mb-4">Spend less time configuring, more time coding. Get your environment up and running in minutes, not hours.</p>
          <ul className="list-disc pl-6">
            <li>Pre-configured templates</li>
            <li>Docker-based isolation</li>
            <li>Cross-platform support</li>
          </ul>
        </Card>
        <Card>
          <h3 className="text-lg font-bold mb-2">For Teams</h3>
          <p className="mb-4">Standardize environments across your organization. Everyone works with the same configuration, eliminating "works on my machine" problems.</p>
          <ul className="list-disc pl-6">
            <li>Consistent environments</li>
            <li>Easy onboarding</li>
            <li>Version controlled setup</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;