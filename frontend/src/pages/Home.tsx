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
        <p className="mb-4">ChimeraStack helps you quickly set up development environments using pre-configured templates.</p>
        <Link to="/templates">
          <Button>Browse Templates</Button>
        </Link>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold mb-2">For Developers</h3>
          <p>Spend less time configuring, more time coding.</p>
        </Card>
        <Card>
          <h3 className="text-lg font-bold mb-2">For Teams</h3>
          <p>Standardize environments across your organization.</p>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;