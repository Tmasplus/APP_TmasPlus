import React, { useState } from 'react';
import CardCorp from '../components/CardCorp';
import BookingHistoryTable from '../components/BookingHistoryTable';


const BookingHistory: React.FC = () => {



  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <h1 className="text-2xl font-bold mb-6">Historial de Reservas</h1>
        <div className="min-h-screen bg-gray-100 p-8">
        <BookingHistoryTable />
        </div>
      </div>
    </div>
  );
};


export default BookingHistory;
