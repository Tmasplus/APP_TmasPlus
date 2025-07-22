import React, { useState } from 'react';

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Asegúrate de que el Sidebar esté correctamente importado

const Layout = () => {
  
    const [isOpen, setIsOpen] = useState(true);
  
    const toggleSidebar = () => {
      setIsOpen(!isOpen);
    };
  
    return (
      <div className="flex">
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
        <div className={`flex-grow transition-margin duration-300 ease-in-out ${isOpen ? 'ml-64' : 'ml-16'}`}>
          <Outlet />
        </div>
      </div>
    );
  };

export default Layout;
