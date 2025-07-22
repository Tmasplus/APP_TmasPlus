import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../slices/usersSlice"; // Ajusta la ruta según corresponda
import { RootState } from "../store/store";
import "react-phone-number-input/style.css"; // Importa el estilo correcto
import PhoneInput from "react-phone-number-input";
import { getUserVerification } from "../common/topus-integration";
import Swal from "sweetalert2";
import axios from 'axios';

interface AddUserModalProps {
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const [usertype, setUserType] = useState<"customer" | "driver" | "company">(
    "customer"
  );
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    docType: "",
    verifyId: "",
    approved: true,
    blocked: false,
    carType: "",
    vehicleNumber: "",
    bussinesName: "",
    profile_image: "",
    reviewed: false,
    signupViaReferral: "",
    term: true,
    walletBallance: 0,
    commission: 0,
    NITType: "NIT",
    NIT: "",
    AccessSubUsers: true,
    emailFact: "",
    ContactUser: "",
  });
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [referralId, setReferralId] = useState("");
  const [isGeneratingReferralId, setIsGeneratingReferralId] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [imageBase64, setImageBase64] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [useVerification, setUseVerification] = useState(false);

  const cities = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"];
  const docTypes = ["CC", "Pasaporte", "CE"];
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const generateReferralId = async () => {
      let unique = false;
      let id;
      while (!unique) {
        id = Math.random().toString(36).substr(2, 5).toUpperCase();
        const response = await fetch(
          "https://us-central1-treasupdate.cloudfunctions.net/validate_referrer",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ referralId: id }),
          }
        );
        const data = await response.json();
        if (!data.uid) {
          unique = true;
        }
      }
      setReferralId(id);
      setIsGeneratingReferralId(false);
    };

    generateReferralId();
  }, []);

  const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserType(e.target.value as "customer" | "driver" | "company");
    setFormData({
      ...formData,
      firstName: "",
      lastName: "",
      email: "",
      city: "",
      docType: "",
      verifyId: "",
      approved: false,
      blocked: false,
      carType: "",
      vehicleNumber: "",
      bussinesName: "",
      profile_image: "",
      reviewed: false,
      signupViaReferral: "",
      term: true,
      walletBallance: 0,
      commission: 0,
      NITType: "NIT",
      NIT: "",
      AccessSubUsers: true,
      emailFact: "",
      ContactUser: "",
    });
    setMobile("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setImageBase64(base64String.split(",")[1]);
        setIsImageUploading(true);

        try {
          const response = await fetch(
            "https://us-central1-treasupdate.cloudfunctions.net/analyzeImage",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ imageBase64: base64String.split(",")[1] }),
            }
          );

          const data = await response.json();
          if (data && data.length > 0) {
            setFormData({
              ...formData,
              verifyId: data[0].description.trim(), // Asume que el texto detectado es el ID
            });
          }
        } catch (error) {
          console.error("Error uploading image:", error);
        } finally {
          setIsImageUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const createdAt = new Date().toISOString();
    const company = user.uid;
    let filteredData = { ...formData, mobile, referralId, usertype, createdAt, company };

    if (useVerification) {
      Swal.fire({
        title: 'Verificando antecedentes...',
        text: 'Este proceso puede tardar varios minutos. Por favor, espera.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      if (filteredData.docType && filteredData.verifyId) {
        try {
          const response = await axios.post('https://us-central1-treasupdate.cloudfunctions.net/getUserVerification', {
            doc_type: filteredData.docType,
            identification: filteredData.verifyId,
            name: filteredData.firstName + " " + filteredData.lastName
          }, {
              timeout: 300000
          });
         
          const results = response.data;

          filteredData = { ...filteredData, securityData:[{antecedents: results, date: Date.now(),verifyId: formData.verifyId,doc_type: formData.docType,firstName: formData.firstName,lastName: formData.lastName}]};

        } catch (error) {
          console.error('Error en la verificación:', error);
          Swal.fire("Error", "Ha ocurrido un error en la verificación de antecedentes. Por favor, intente nuevamente.", "error");
          return;
        }
      }
    }

    const result = await dispatch(addUser(filteredData, password));

    if (result.success) {
      Swal.close();
      setShowSuccessModal(true);
    } else {
      Swal.fire("Error", "Hubo un problema al crear el usuario.", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl mb-4">Añadir Usuario</h2>
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Tipo de Usuario</label>
            <select
              value={usertype}
              onChange={handleUserTypeChange}
              className="w-full p-2 border rounded"
              disabled={user?.usertype === "company"}
            >
              {user?.usertype !== "company" && (
                <>
                  <option value="customer">Cliente</option>
                  <option value="driver">Conductor</option>
                  <option value="company">Empresa</option>
                </>
              )}
              {user?.usertype === "company" && (
                <option value="customer">Cliente</option>
              )}
            </select>
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="useVerification"
              checked={useVerification}
              onChange={(e) => setUseVerification(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="useVerification" className="text-gray-700">
              Usar verificación de antecedentes
            </label>
          </div>

          {usertype === "customer" && (
            <>
              <label className="block text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block text-gray-700 mb-2">Apellido</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block text-gray-700 mb-2">Ciudad</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              >
                <option value="">Selecciona una ciudad</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <label className="block text-gray-700 mb-2">
                Tipo de Documento
              </label>
              <select
                name="docType"
                value={formData.docType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              >
                <option value="">Selecciona un tipo de documento</option>
                {docTypes.map((docType) => (
                  <option key={docType} value={docType}>
                    {docType}
                  </option>
                ))}
              </select>
              <label className="block text-gray-700 mb-2">
                Número de Documento
              </label>
              <input
                type="text"
                name="verifyId"
                value={formData.verifyId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block text-gray-700 mb-2">Referral ID</label>
              <input
                type="text"
                name="referralId"
                value={referralId}
                readOnly
                className="w-full p-2 border rounded mb-4"
              />
            </>
          )}

          {usertype === "driver" && (
            <>
              <label className="block text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block text-gray-700 mb-2">Apellido</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block text-gray-700 mb-2">
                Tipo de Vehículo
              </label>
              <input
                type="text"
                name="carType"
                value={formData.carType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block text-gray-700 mb-2">
                Número del Vehículo
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block text-gray-700 mb-2">Referral ID</label>
              <input
                type="text"
                name="referralId"
                value={referralId}
                readOnly
                className="w-full p-2 border rounded mb-4"
              />

              <label className="block text-gray-700 mb-2">Subir Imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 border rounded mb-4"
              />
              {isImageUploading && (
                <p className="text-red-500">Subiendo imagen...</p>
              )}
            </>
          )}

          {usertype === "company" && (
            <>
              <label className="block text-gray-700 mb-2">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                name="bussinesName"
                value={formData.bussinesName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block text-gray-700 mb-2">
                Persona de Contacto
              </label>
              <input
                type="text"
                name="ContactUser"
                value={formData.ContactUser}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block text-gray-700 mb-2">NIT</label>
              <input
                type="text"
                name="NIT"
                value={formData.NIT}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block text-gray-700 mb-2">
                Email de Facturacion
              </label>
              <input
                type="email"
                name="emailFact"
                value={formData.emailFact}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block text-gray-700 mb-2">Comision</label>
              <input
                type="text"
                name="commission"
                value={formData.commission}
                onChange={handleInputChange}
                className="w-full p-2 border rounded mb-4"
              />
            </>
          )}

          <label className="block text-gray-700 mb-2">Teléfono</label>
          <PhoneInput
            defaultCountry="CO"
            value={mobile}
            onChange={setMobile}
            className="w-full p-2 border rounded mb-4"
          />

          <label className="block text-gray-700 mb-2">Contraseña</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white py-2 px-4 rounded-lg mr-2 hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`py-2 px-4 rounded-lg ${
                isGeneratingReferralId
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red_treas hover:bg-red-700 text-white"
              }`}
              disabled={isGeneratingReferralId}
            >
              {isGeneratingReferralId ? "Esperando referral ID" : "Guardar"}
            </button>
          </div>
        </form>

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl mb-4">Usuario creado con éxito</h2>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onClose();
                }}
                className="bg-red_treas text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUserModal;
