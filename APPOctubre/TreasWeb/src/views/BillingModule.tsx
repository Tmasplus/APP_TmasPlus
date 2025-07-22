import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { Booking } from '../interfaces/types';
import { getDatabase, ref, query, orderByChild, equalTo, get, update } from 'firebase/database';
import Papa from 'papaparse';
import { FiRefreshCw } from 'react-icons/fi'; // Import the refresh icon
import { FaDollarSign } from 'react-icons/fa'; // Import another icon
import { BsFillPencilFill } from "react-icons/bs";
import { updateBooking } from '../slices/bookingSlice';
import Loader from '../components/Loader';

const BillingModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [referenceSearch, setReferenceSearch] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null); // State to track which booking is being edited
  const [editedBooking, setEditedBooking] = useState<Partial<Booking>>({});
  const user = useSelector((state: RootState) => state.auth.user);
  const filteredUsers = useSelector((state: RootState) => state.users.filteredUsers);
  const dispatch = useDispatch();

  const placeholderImage = '/src/assets/1.png'; // Update this path to your placeholder image

  const handleSearch = async () => {
    if (!searchTerm && !referenceSearch) {
      setBookings([]);
      return;
    }

    setLoading(true);
    const db = getDatabase();
    let bookingsRef;

    if (referenceSearch) {
      // Buscar por reference
      bookingsRef = query(
        ref(db, 'bookings'),
        orderByChild('reference'),
        equalTo(referenceSearch)
      );
    } else {
      // Buscar por company
      bookingsRef = query(
        ref(db, 'bookings'),
        orderByChild('company'),
        equalTo(searchTerm)
      );
    }

    try {
      const snapshot = await get(bookingsRef);
      const data = snapshot.val();

      if (data) {
        const filteredBookings = Object.keys(data)
          .map((key) => ({
            ...data[key],
            uid: key,
          }))
          .filter((booking) => booking.status === 'COMPLETE' && booking.companyInvoices !== 'Facturado/Pagado' && booking.companyInvoices !== 'Facturado')
          .sort((a, b) => new Date(b.tripdate).getTime() - new Date(a.tripdate).getTime()); // Order by newest first

        setBookings(filteredBookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const csvData = bookings.map(booking => ({
      Fecha_de_Servicio: new Date(booking.tripdate).toLocaleString(),
      Cliente: booking.customer_name,
      Conductor: booking.driver_name,
      Referencia_del_Servicio: booking.reference,
      Ingreso_Conductor: booking.driver_share,
      El_Cliente_pago_Empresarial: booking.cost_corp,
      Base_IVA: booking.Base_de_IVA,
      IVA: booking.Iva,
      Ganancia_TREAS: booking.ProfitsTreas,
      Hosting_Tecnologico: booking.Technological_Hosting,
      Origen: booking.pickupAddress,
      Destino: booking.dropAddress,
      Tipo_de_Servicio: booking.carType,
      Inicio_del_Viaje: booking.trip_start_time,
      Fin_del_Viaje: booking.trip_end_time,
      Estado_de_Facturacion: booking.companyInvoices,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reservas_completadas_${searchTerm}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = (bookingId: string) => {
    const booking = bookings.find(b => b.uid === bookingId);
    if (!booking) return;
  
    const selectedUserData = filteredUsers.find(user => user.id === booking.company);
    if (!selectedUserData) return;
    console.log("hello world",selectedUserData)
    const commissionPercentage = Number(selectedUserData.commission) || 0;
    console.log("comision hotel",commissionPercentage)
    const tripCost = Number(booking.trip_cost) || 0;
  
    const commissionCompany = tripCost * commissionPercentage;
    const ProfitsTreas = tripCost * 0.30;
    const TechnologicalHosting = ProfitsTreas + 800;
  
    const PolicyPackage = 800;
    const BaseDeIVA = tripCost * 0.08;
    const Iva = BaseDeIVA * 0.19;
    const costCorp = tripCost + commissionCompany + PolicyPackage + BaseDeIVA + Iva + ProfitsTreas;
  
    const updatedBooking = {
      ...booking,
      trip_cost: tripCost,
      commissionCompany,
      comisioCompany:commissionCompany,
      PolicyPackage,
      Base_de_IVA: BaseDeIVA,
      Iva,
      cost_corp: costCorp,
      ProfitsTreas,
      Technological_Hosting: TechnologicalHosting
    };
  
    console.log("updated", updatedBooking);
    dispatch(updateBooking(bookingId, updatedBooking));
    handleSearch(); // Refresh the bookings list
  };
  
  const handleEdit = (booking: Booking) => {
    setEditingBookingId(booking.uid);
    setEditedBooking(booking);
  };

  const handleSave = async () => {
    if (!editingBookingId) return;

    try {
      const db = getDatabase();
      await update(ref(db, `bookings/${editingBookingId}`), editedBooking);
      dispatch(updateBooking(editingBookingId, editedBooking));
      setEditingBookingId(null);
      setEditedBooking({});
      handleSearch(); // Refresh the bookings list
    } catch (error) {
      console.error("Error saving booking:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedBooking((prev) => ({ ...prev, [name]: value }));
  };


  const roundPrice = (price) => {
    const remainder = price % 50;
    if (remainder > 0) {
      return price - remainder + 50;
    }
    return price;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="sticky top-0 bg-slate-50 z-10 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-black">Facturación de Empresas</h1>
          <div className="flex space-x-2">
            <select
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 rounded bg-white text-black placeholder:text-black"
            >
              <option value="">Selecciona un negocio</option>
              {filteredUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {`${user.bussinesName} - NIT: ${user.mobile} - Email: ${user.email}`}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Buscar por referencia"
              value={referenceSearch}
              onChange={(e) => setReferenceSearch(e.target.value)}
              className="p-2 rounded bg-white text-black placeholder:text-black"
            />
            <button
              onClick={handleSearch}
              className="bg-red-700 text-white py-2 px-4 rounded-lg shadow-2xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-900 focus:ring-opacity-50 transition duration-300 ease-in-out"
            >
              Buscar
            </button>
          </div>
        </div>
      </header>
      <div>
        {loading ? (
          <div className="text-center text-xl"><Loader/></div>
        ) : (
          bookings.length > 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Reservas Completadas</h2>
                <button
                  onClick={downloadCSV}
                  className="bg-red_treas text-white py-2 px-4 rounded-lg shadow-2xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-900 focus:ring-opacity-50 transition duration-300 ease-in-out"
                >
                  Descargar CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Fecha de Servicio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Conductor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Referencia del Servicio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Ingreso Conductor ($)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">El Cliente pago Empresarial ($)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Comision Emprersa($)</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Base IVA ($)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">IVA</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Hosting Tecnologico</th>
                      
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Origen</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Destino</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Tipo de Servicio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Inicio del Viaje</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Fin del Viaje</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Estado de Facturacion</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map(booking => (
                      <>
                        <tr key={booking.uid}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(booking.tripdate).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.customer_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.driver_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.reference}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${roundPrice(booking.trip_cost)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${roundPrice(booking.cost_corp)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${roundPrice(booking.comisioCompany)}</td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${roundPrice(booking.Base_de_IVA)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${roundPrice(booking.Iva)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${roundPrice(booking.Technological_Hosting)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.pickupAddress}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.dropAddress}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.carType}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.trip_start_time}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.trip_end_time}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.companyInvoices}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button onClick={() => handleRefresh(booking.uid)} className="flex items-center space-x-2 text-white hover:bg-red-400 px-4 bg-red_treas rounded-2xl">
                                <FiRefreshCw size={20} />
                                <span>Recalcular</span>
                              </button>
                              <button onClick={() => handleEdit(booking)} className="flex items-center space-x-2 text-white hover:bg-red-500 px-4 bg-red-300 rounded-2xl py-2">
                                <BsFillPencilFill size={20} />
                                <span>Editar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {editingBookingId === booking.uid && (
                          <tr>
                            <td colSpan={17} className="p-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Costo del viaje ($)</label>
                                  <input
                                    type="number"
                                    name="trip_cost"
                                    value={editedBooking.trip_cost || ''}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">El Cliente pago Empresarial ($)</label>
                                  <input
                                    type="number"
                                    name="cost_corp"
                                    value={editedBooking.cost_corp || ''}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Comision Empresa ($)</label>
                                  <input
                                    type="number"
                                    name="comisioCompany"
                                    value={editedBooking.comisioCompany || ''}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Base IVA ($)</label>
                                  <input
                                    type="number"
                                    name="Base_de_IVA"
                                    value={editedBooking.Base_de_IVA || ''}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">IVA</label>
                                  <input
                                    type="number"
                                    name="Iva"
                                    value={editedBooking.Iva || ''}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Ganancia TREAS</label>
                                  <input
                                    type="number"
                                    name="ProfitsTreas"
                                    value={editedBooking.ProfitsTreas || ''}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Hosting Tecnologico</label>
                                  <input
                                    type="number"
                                    name="Technological_Hosting"
                                    value={editedBooking.Technological_Hosting || ''}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Estado de Facturacion</label>
                                  <select
                                    name="companyInvoices"
                                    value={editedBooking.companyInvoices || ''}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  >
                                    <option value="Facturado">Facturado</option>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Pagado/Facturado">Pagado/Facturado</option>
                                  </select>
                                </div>
                                <div className="col-span-2 flex justify-end space-x-2">
                                  <button
                                    onClick={() => setEditingBookingId(null)}
                                    className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={handleSave}
                                    className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">No se encontraron reservas completadas para el negocio seleccionado.</div>
          )
        )}
      </div>
    </div>
  );
};

export default BillingModule;
