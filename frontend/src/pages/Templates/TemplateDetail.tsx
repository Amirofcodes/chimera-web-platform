import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { Spinner } from '../../components/shared/Spinner';
import { templateService } from '../../services/templateService';

const TemplateDetailPage = () => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 
 const [template, setTemplate] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [creating, setCreating] = useState(false);

 useEffect(() => {
   const fetchTemplate = async () => {
     setLoading(true);
     try {
       const templateData = await templateService.get(id || '');
       setTemplate(templateData);
       setError(null);
     } catch (err) {
       console.error('Error fetching template:', err);
       setError('Template not found');
     } finally {
       setLoading(false);
     }
   };

   fetchTemplate();
 }, [id]);

 const handleDownloadTemplate = async () => {
   setCreating(true);
   try {
     const downloadUrl = await templateService.download(id || '');
     
     // Create a temporary anchor element to trigger download
     const link = document.createElement('a');
     link.href = downloadUrl;
     link.setAttribute('download', `${template.name}.zip`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     
   } catch (error) {
     console.error('Download failed:', error);
     setError('Failed to download template');
   } finally {
     setCreating(false);
   }
 };

 if (loading) return (
   <div className="flex justify-center items-center py-12">
     <Spinner size="lg" />
   </div>
 );

 if (error) return (
   <div className="bg-red-50 text-red-600 p-4 rounded">
     {error}
   </div>
 );

 if (!template) return null;

 return (
   <div>
     <h1 className="text-2xl font-bold mb-6">{template.name}</h1>
     
     <Card className="mb-6">
       <h2 className="text-xl font-semibold mb-4">Description</h2>
       <p className="mb-4">{template.longDescription}</p>
       <div className="flex flex-wrap gap-2 mb-4">
       {template.tags.map((tag: string) => (
           <span 
             key={tag} 
             className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
           >
             {tag}
           </span>
         ))}
       </div>
       <Button 
         onClick={handleDownloadTemplate} 
         isLoading={creating}
       >
         Download Template
       </Button>
     </Card>
     
     <Card>
       <h2 className="text-xl font-semibold mb-4">Services</h2>
       <div className="overflow-x-auto">
         <table className="min-w-full">
           <thead>
             <tr className="bg-gray-50">
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
             </tr>
           </thead>
           <tbody className="bg-white divide-y divide-gray-200">
           {template.services.map((service: { name: string, type: string, port: number }) => (
               <tr key={service.name}>
                 <td className="px-6 py-4 whitespace-nowrap">{service.name}</td>
                 <td className="px-6 py-4 whitespace-nowrap">{service.type}</td>
                 <td className="px-6 py-4 whitespace-nowrap">{service.port}</td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </Card>
   </div>
 );
};

export default TemplateDetailPage;