import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { fetchSettings, updateSetting } from "../slices/settings";
import Switch from "react-switch";

const SettingsView = () => {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector(
    (state: RootState) => state.settings
  );
  const [activeSection, setActiveSection] = useState("company");

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const handleSwitchChange = (key, value) => {
    dispatch(updateSetting(key, value));
  };

  const handleInputChange = (key, event) => {
    const value = event.target.value;
    dispatch(updateSetting(key, value));
  };

  if (status === "loading") return <div>Cargando...</div>;
  if (status === "failed") return <div>Error: {error}</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Configuraciones</h1>

        {/* Section Navigation */}
        <div className="flex mb-8">
          <button
            onClick={() => setActiveSection("company")}
            className={`mr-4 ${
              activeSection === "company" ? "font-bold text-red_treas" : ""
            }`}
          >
            Información de la Empresa
          </button>
          <button
            onClick={() => setActiveSection("app")}
            className={`mr-4 ${
              activeSection === "app" ? "font-bold text-red_treas" : ""
            }`}
          >
            Configuraciones de la App
          </button>
          <button
            onClick={() => setActiveSection("social")}
            className={`mr-4 ${
              activeSection === "social" ? "font-bold text-red_treas" : ""
            }`}
          >
            Información Social
          </button>
          <button
            onClick={() => setActiveSection("security")}
            className={`mr-4 ${
              activeSection === "security" ? "font-bold text-red_treas" : ""
            }`}
          >
            Seguridad
          </button>
          <button
            onClick={() => setActiveSection("other")}
            className={`${
              activeSection === "other" ? "font-bold text-red_treas" : ""
            }`}
          >
            Otras Configuraciones
          </button>
        </div>

        {/* Company Information */}
        {activeSection === "company" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Información de la Empresa</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Nombre de la Empresa</label>
                <input
                  type="text"
                  value={data?.CompanyName}
                  onChange={(e) => handleInputChange("CompanyName", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Dirección de la Empresa
                </label>
                <input
                  type="text"
                  value={data?.CompanyAddress}
                  onChange={(e) => handleInputChange("CompanyAddress", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Teléfono de la Empresa
                </label>
                <input
                  type="text"
                  value={data?.CompanyPhone}
                  onChange={(e) => handleInputChange("CompanyPhone", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={data?.contact_email}
                  onChange={(e) => handleInputChange("contact_email", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Sitio Web</label>
                <input
                  type="text"
                  value={data?.CompanyWebsite}
                  onChange={(e) => handleInputChange("CompanyWebsite", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Application Settings */}
        {activeSection === "app" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Configuraciones de la App</h2>
            <div className="space-y-4">
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">Nombre de la App</label>
                <input
                  type="text"
                  value={data?.appName}
                  onChange={(e) => handleInputChange("appName", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">Versión</label>
                <input
                  type="text"
                  value={data?.versionWeb}
                  onChange={(e) => handleInputChange("versionWeb", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">Símbolo</label>
                <input
                  type="text"
                  value={data?.symbol}
                  onChange={(e) => handleInputChange("symbol", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">Código</label>
                <input
                  type="text"
                  value={data?.code}
                  onChange={(e) => handleInputChange("code", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">Incremento</label>
                <input
                  type="text"
                  value={data?.Increase}
                  onChange={(e) => handleInputChange("Increase", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">
                  Radio del Conductor
                </label>
                <input
                  type="text"
                  value={data?.driverRadius}
                  onChange={(e) => handleInputChange("driverRadius", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Social Media */}
        {activeSection === "social" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Redes Sociales</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Facebook</label>
                <input
                  type="text"
                  value={data?.FacebookHandle}
                  onChange={(e) => handleInputChange("FacebookHandle", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Instagram</label>
                <input
                  type="text"
                  value={data?.InstagramHandle}
                  onChange={(e) => handleInputChange("InstagramHandle", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Twitter</label>
                <input
                  type="text"
                  value={data?.TwitterHandle}
                  onChange={(e) => handleInputChange("TwitterHandle", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">Enlace Dinámico</label>
                <input
                  type="text"
                  value={data?.DinamikLink}
                  onChange={(e) => handleInputChange("DinamikLink", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeSection === "security" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Configuraciones de Seguridad</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">OTP Seguro</label>
                <Switch
                  onChange={(checked) =>
                    handleSwitchChange("otp_secure", checked)
                  }
                  checked={data?.otp_secure}
                  onColor="#ff0000"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">
                  OTP Móvil Personalizado
                </label>
                <Switch
                  onChange={(checked) =>
                    handleSwitchChange("customMobileOTP", checked)
                  }
                  checked={data?.customMobileOTP}
                  onColor="#ff0000"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">
                  Aprobación de ID de Imagen
                </label>
                <Switch
                  onChange={(checked) =>
                    handleSwitchChange("imageIdApproval", checked)
                  }
                  checked={data?.imageIdApproval}
                  onColor="#ff0000"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">
                  Imagen de Licencia Requerida
                </label>
                <Switch
                  onChange={(checked) =>
                    handleSwitchChange("license_image_required", checked)
                  }
                  checked={data?.license_image_required}
                  onColor="#ff0000"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">
                  Imagen SOAT Requerida
                </label>
                <Switch
                  onChange={(checked) =>
                    handleSwitchChange("SOAT_image_required", checked)
                  }
                  checked={data?.SOAT_image_required}
                  onColor="#ff0000"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4"> Membresías</label>
                <Switch
                  onChange={(checked) =>
                    handleSwitchChange("Membership", checked)
                  }
                  checked={data?.Membership}
                  onColor="#ff0000"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4"> Kilómetros Wallet</label>
                <Switch
                  onChange={(checked) =>
                    handleSwitchChange("KilimetrsWallet", checked)
                  }
                  checked={data?.KilimetrsWallet}
                  onColor="#ff0000"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4"> Aprobación Automática de Vehículo</label>
                <Switch
                  onChange={(checked) =>
                    handleSwitchChange("carApproval", checked)
                  }
                  checked={data?.carApproval}
                  onColor="#ff0000"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">
                  Aprobación de Conductor
                </label>
                <Switch
                  onChange={(checked) =>
                    handleSwitchChange("driver_approval", checked)
                  }
                  checked={data?.driver_approval}
                  onColor="#ff0000"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">
                  Membresía TREAS-X
                </label>
                <Switch
                  onChange={(checked) =>
                    handleSwitchChange("membership_TreasX", checked)
                  }
                  checked={data?.membership_TreasX}
                  onColor="#ff0000"
                />
              </div>
              {/* Términos y Condiciones  <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">
                  Términos y Condiciones
                </label>
                <Switch
                  onChange={(checked) =>
                    handleSwitchChange("term_required", checked)
                  }
                  checked={data?.term_required}
                  onColor="#ff0000"
                />
              </div>*/}
            </div>
          </div>
        )}

        {/* Other Settings */}
        {activeSection === "other" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Otras Configuraciones</h2>
            <div className="space-y-4">
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">Flujo de Reservas</label>
                <input
                  type="text"
                  value={data?.bookingFlow}
                  onChange={(e) => handleInputChange("bookingFlow", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">Latencia Falsa</label>
                <input
                  type="text"
                  value={data?.FakeLatency}
                  onChange={(e) => handleInputChange("FakeLatency", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">
                  Campo de Dinero en Billetera
                </label>
                <input
                  type="text"
                  value={data?.walletMoneyField}
                  onChange={(e) => handleInputChange("walletMoneyField", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">
                  Comisión de Hotel
                </label>
                <input
                  type="text"
                  value={data?.CommisionHotel}
                  onChange={(e) => handleInputChange("CommisionHotel", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">
                  Número del Botón de Pánico
                </label>
                <input
                  type="text"
                  value={data?.panic}
                  onChange={(e) => handleInputChange("panic", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-gray-700 mr-4">
                  Lista de Ciudades
                </label>
                <input
                  type="text"
                  value={data?.ListCities}
                  onChange={(e) => handleInputChange("ListCities", e)}
                  className="w-full border rounded-2xl-md p-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Botón para Guardar Cambios  <div className="text-center">
          <button className="bg-red_treas hover:bg-red-300 text-white py-2 px-6 rounded-2xl">
            Guardar cambios
          </button>
        </div>*/}
      </div>
    </div>
  );
};

export default SettingsView;
