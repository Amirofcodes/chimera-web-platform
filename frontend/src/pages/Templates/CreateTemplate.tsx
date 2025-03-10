import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { Service } from '../../services/templateService';

const CreateTemplatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [services, setServices] = useState<Service[]>([
    { name: '', type: '', port: 0 }
  ]);

  const handleAddService = () => {
    setServices([...services, { name: '', type: '', port: 0 }]);
  };

  const handleServiceChange = (index: number, field: keyof Service, value: string | number) => {
    const updatedServices = [...services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: field === 'port' ? Number(value) : value
    };
    setServices(updatedServices);
  };

  const handleRemoveService = (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Mock API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Template created successfully
      navigate('/templates');
    } catch (err) {
      setError('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Template</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Template Name
            </label>
            <input
              id="name"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span 
                  key={tag} 
                  className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded flex items-center"
                >
                  {tag}
                  <button 
                    type="button" 
                    className="ml-1 text-blue-500 hover:text-blue-700"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
              />
              <button
                type="button"
                className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600"
                onClick={handleAddTag}
              >
                Add
              </button>
            </div>
          </div>
        </Card>
        
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Services</h2>
          
          {services.map((service, index) => (
            <div key={index} className="mb-6 p-4 border rounded">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold">Service #{index + 1}</h3>
                {services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveService(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    value={service.name}
                    onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Type
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    value={service.type}
                    onChange={(e) => handleServiceChange(index, 'type', e.target.value)}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="web">Web Server</option>
                    <option value="app">Application</option>
                    <option value="db">Database</option>
                    <option value="cache">Cache</option>
                    <option value="api">API</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Port
                  </label>
                  <input
                    type="number"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    value={service.port || ''}
                    onChange={(e) => handleServiceChange(index, 'port', e.target.value)}
                    min="0"
                    max="65535"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddService}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <span className="mr-1">+</span> Add Service
          </button>
        </Card>
        
        <div className="flex justify-end">
          <Button
            variant="secondary"
            className="mr-2"
            onClick={() => navigate('/templates')}
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            isLoading={loading}
            type="submit"
          >
            Create Template
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTemplatePage;