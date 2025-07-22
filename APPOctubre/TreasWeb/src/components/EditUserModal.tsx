import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteUser } from "../slices/authSlice";
import { listenToWalletHistory } from "../actions/walletActions";
import { RootState } from "../store/store";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import defaultProfileImage from "../assets/1.png";
import CarnetCustomer from "./../assets/cardid_rider.png";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";
import useUserCars from "../slices/carSlice";
import VehicleCard from "./VehicleCard";
import CardCorp from "./CardCorp";
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  equalTo,
  get,
} from "firebase/database";
import defaultDocumentImage from "../assets/Subir Doc.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Switch from "react-switch";
import ContractDisplay from "./ContractDisplay";
import noVehiclesImage from "../assets/24.png";
import { FaPlusCircle } from "react-icons/fa"; // Importa el ícono
import CreateVehicleModal from "./CreateVehicleModal";
import Swal from "sweetalert2";
import axios from "axios";
import { updateUserWithoutAuth } from "../slices/authSlice";
import { cancelMembership, createMembership } from "../slices/membershipSlice"; // Importa la acción para cancelar la membresía

const apiFetchMemberships = async (uid: string) => {
  try {
    console.log("Buscando membresías para el UID:", uid);
    const membershipRef = query(
      ref(getDatabase(), "Memberships/"),
      orderByChild("conductor"),
      equalTo(uid)
    );
    const snapshot = await get(membershipRef);

    if (snapshot.exists()) {
      const memberships = Object.values(snapshot.val());
      return memberships;
    } else {
      console.log("No se encontraron membresías para el UID:", uid);
      return []; // Retornamos un array vacío si no se encuentran membresías
    }
  } catch (error) {
    console.error("Error al obtener membresías desde Firebase:", error);
    throw error;
  }
};

const EditUserModal: React.FC<{
  user: any;
  onClose: () => void;
  onSave: (updatedUser: any) => Promise<boolean>;
  isUpdateUser: boolean;
}> = ({ user, onClose, onSave, isUpdateUser }) => {
  const [formData, setFormData] = useState({
    ...user,
    reviewed: user.reviewed || false,
  });
  const [formData2, setFormData2] = useState(() =>
    JSON.parse(JSON.stringify(user))
  );

  const [isDirty, setIsDirty] = useState(false);
  const [selectedOption, setSelectedOption] = useState("accountDetails");
  const [vehicleDocuments, setVehicleDocuments] = useState([
    {
      name: "SOAT",
      url: user.SOATImage || defaultDocumentImage,
      fileName: "SOATImage",
    },
    {
      name: "T .Propiedad Frontal",
      url: user.cardPropImage || defaultDocumentImage,
      fileName: "cardPropImage",
    },
    {
      name: "T. Propiedad Posterior",
      url: user.cardPropImageBK || defaultDocumentImage,
      fileName: "cardPropImageBK",
    },
    {
      name: "Licencia Frontal",
      url: user.licenseImage || defaultDocumentImage,
      fileName: "licenseImage",
    },
    {
      name: "Licencia Posterior",
      url: user.licenseImageBack || defaultDocumentImage,
      fileName: "licenseImageBack",
    },
    {
      name: "Cédula Frontal",
      url: user.verifyIdImage || defaultDocumentImage,
      fileName: "verifyIdImage",
    },
    {
      name: "Cédula Posterior",
      url: user.verifyIdImageBk || defaultDocumentImage,
      fileName: "verifyIdImageBk",
    },
    {
      name: "SOAT V2",
      url: user.SOATImagev2 || defaultDocumentImage,
      fileName: "SOATImagev2",
    },
    {
      name: "T .Propiedad Frontal v2",
      url: user.cardPropImagev2 || defaultDocumentImage,
      fileName: "cardPropImagev2",
    },
    {
      name: "T. Propiedad Posterior v2",
      url: user.cardPropImageBK2 || defaultDocumentImage,
      fileName: "cardPropImageBKv2",
    },
    //  { name: 'SOAT V3', url: user.SOATimagev3 || defaultDocumentImage, fileName: 'SOATImagev3' },
    //{ name: 'Propietario Frontal v3', url: user.cardPropImagev3 || defaultDocumentImage, fileName: 'cardPropImagev3' },
    //{ name: 'Propietario Trasero v3', url: user.cardPropImageBK3 || defaultDocumentImage, fileName: 'cardPropImageBKv3' }
  ]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    fileName: string;
  } | null>(null);
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(
    null
  );
  const [showImageModal, setShowImageModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar la visibilidad del modal
  const [data, setData] = useState("");

  const dispatch = useDispatch();
  const { history, loading, error } = useSelector(
    (state: RootState) => state.wallet
  );
  const { cars } = useUserCars(user.id);
  const { filteredUsers } = useSelector((state: RootState) => state.users);
  const authState = useSelector((state: RootState) => state.auth.user);
  const [referrerName, setReferrerName] = useState<string | null>(null);
 // console.log(formData, "formData");
  const {
    allUsers,
    loading: usersLoading,
    error: usersError,
  } = useSelector((state: RootState) => state.users);
  const cities = [
    "Bogota",
    "Medellin",
    "Cali",
    "Barranquilla",
    "Cartagena",
    "Cucuta",
    "Bucaramanga",
    "Pereira",
    "Santa Marta",
    "Ibague",
    "Pasto",
    "Manizales",
    "Neiva",
    "Villavicencio",
    "Armenia",
    "Valledupar",
    "Montería",
    "Sincelejo",
    "Popayán",
    "Floridablanca",
    "Palmira",
    "Bello",
    "Soledad",
    "Itagüí",
    "San Juan de Pasto",
    "Santa Rosa de Cabal",
    "Tuluá",
    "Yopal",
    "Barrancabermeja",
    "Tumaco",
    "Florencia",
    "Girardot",
    "Zipaquira",
    "Buenaventura",
    "Riohacha",
    "Duitama",
    "Quibdó",
    "Arauca",
    "Tunja",
    "Magangué",
    "Sogamoso",
    "Giron",
    "Chia",
    "Facatativa",
    "Rionegro",
    "Piedecuesta",
    "Ciénaga",
    "La Dorada",
    "Maicao",
    "Barrancas",
    "Calarcá",
    "Fundación",
    "La Ceja",
    "Chiquinquirá",
    "Sahagún",
    "Villa del Rosario",
    "Montelíbano",
    "Arjona",
    "Turbo",
    "Tame",
    "El Banco",
    "Sabanalarga",
    "Ipiales",
    "Tuquerres",
    "Pitalito",
    "Distracción",
    "La Plata",
    "Chiriguaná",
    "Baranoa",
    "El Carmen de Bolívar",
    "San Jacinto",
    "Santo Tomás",
    "Repelón",
    "Planeta Rica",
    "El Retén",
    "Ciénaga de Oro",
    "San Onofre",
    "María la Baja",
    "Clemencia",
    "San Juan Nepomuceno",
    "El Guamo",
    "Carmen de Bolívar",
    "Sampués",
    "San Carlos",
    "Morroa",
    "Corozal",
    "Santa Rosa de Lima",
    "Turbaco",
    "San Juan del Cesar",
    "Ayapel",
    "Cereté",
    "Momil",
    "Sincé",
    "Chinú",
    "Ovejas",
    "Tolu",
    "Tuchin",
    "Bosconia",
    "Aguachica",
    "Gamarra",
    "San Alberto",
    "Curumaní",
    "Manaure",
    "Copey",
    "San Diego",
    "La Paz",
    "Valencia",
    "San Martin",
    "San Andres",
    "Providencia",
    "San Vicente del Caguan",
    "Mocoa",
    "Puerto Asis",
  ];
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [memberships, setMemberships] = useState<any[]>([]);

  useEffect(() => {
    const fetchMemberships = async () => {
      const memberships = await apiFetchMemberships(user.id);
      setMemberships(memberships);
    };

    fetchMemberships();
  }, [user.id]);

  useEffect(() => {
    if (formData.signupViaReferral) {
      const referrer = allUsers.find(
        (user) => user.id === formData.signupViaReferral
      );
      if (referrer) {
        setReferrerName(
          `${referrer.firstName} ${referrer.lastName} (UID: ${referrer.id})`
        );
      } else {
        setReferrerName(null);
      }
    }
  }, [formData.signupViaReferral, allUsers]);
  useEffect(() => {
    if (formData.id) {
      dispatch(listenToWalletHistory(formData.id));
      fetchUserBookings(formData.id, user.usertype);
    }
  }, [formData.id, dispatch]);

  useEffect(() => {
    if (!isDirty) {
      // Solo actualizar el formData si no se ha realizado ningún cambio
      setFormData({ ...user, reviewed: user.reviewed || false });
    }
  }, [user, isDirty]);

  const fetchUserBookings = async (userId: string, userType: string) => {
    console.log(userType);
    const db = getDatabase();
    let bookingsRef;

    if (userType === "customer") {
      bookingsRef = query(
        ref(db, "bookings"),
        orderByChild("customer"),
        equalTo(userId)
      );
    } else if (userType === "driver") {
      bookingsRef = query(
        ref(db, "bookings"),
        orderByChild("driver"),
        equalTo(userId)
      );
    } else if (userType === "company") {
      bookingsRef = query(
        ref(db, "bookings"),
        orderByChild("company"),
        equalTo(userId)
      );
    }

    try {
      const snapshot = await get(bookingsRef);
      const data = snapshot.val();

      if (data) {
        const bookings = Object.keys(data).map((key) => ({
          ...data[key],
          uid: key,
        }));

        // Invertir el orden de las reservas para mostrar las más recientes primero
        bookings.reverse();

        setUserBookings(bookings);
      } else {
        setUserBookings([]);
      }
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      setUserBookings([]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    setIsDirty(true);
  };
  // Añadir la función para eliminar una dirección
  const handleDeleteAddress = (addressKey: string) => {
    // Confirmar la eliminación
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción eliminará la dirección seleccionada.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Crear un nuevo objeto de direcciones sin la dirección eliminada
        const updatedAddresses = { ...formData.savedAddresses };
        delete updatedAddresses[addressKey];
  
        // Crear un nuevo objeto de usuario con las direcciones actualizadas
        const updatedUser = {
          ...formData,
          savedAddresses: updatedAddresses,
        };
  
        try {
          // Despachar la acción para actualizar el usuario
          const success = await dispatch(updateUserWithoutAuth(updatedUser)).unwrap();
          
          if (!success) { // Según tu implementación, 'false' indica éxito
            // Actualizar el estado local con las direcciones eliminadas
            setFormData(updatedUser);
            setIsDirty(true);
            
            // Mostrar mensaje de éxito
            Swal.fire(
              'Eliminada',
              'La dirección ha sido eliminada y el usuario actualizado.',
              'success'
            );
          } else {
            // Mostrar mensaje de error si hubo un problema al actualizar
            Swal.fire(
              'Error',
              'Hubo un problema al actualizar el usuario.',
              'error'
            );
          }
        } catch (error) {
          // Manejar errores inesperados
          console.error("Error al actualizar el usuario:", error);
          Swal.fire(
            'Error',
            'Ocurrió un error al intentar eliminar la dirección.',
            'error'
          );
        }
      }
    });
  };

  const handleSaveClick = async () => {
    if (selectedProfileFile) {
      const fileUrl = await uploadImage(
        [selectedProfileFile],
        ["profileImage"]
      );
      formData.profile_image = fileUrl[0]; // Handle as array
      setSelectedProfileFile(null);
    }

    const filesToUpload = vehicleDocuments
      .filter((doc) => doc.file)
      .map((doc) => doc.file);

    const fileNames = vehicleDocuments
      .filter((doc) => doc.file)
      .map((doc) => doc.fileName);

    // Only call uploadImage if there are files to upload
    if (filesToUpload.length > 0) {
      const urls = await uploadImage(filesToUpload, fileNames);
      urls.forEach((url, index) => {
        formData[fileNames[index]] = url;
      });
    }

    const success = await onSave(formData);
    if (success) {
      setIsDirty(false);
      setShowSuccessModal(true);
    } else {
      setShowErrorModal(true);
    }
  };

  const countValidDocuments = () => {
    if (user.usertype === "driver") {
      // Count all documents for drivers
      return vehicleDocuments.filter(
        (doc) => doc.url && doc.url !== defaultDocumentImage
      ).length;
    } else if (user.usertype === "customer") {
      // Only count 'verifyIdImage' and 'verifyIdImageBk' for customers
      return vehicleDocuments.filter(
        (doc) =>
          (doc.fileName === "verifyIdImage" ||
            doc.fileName === "verifyIdImageBk") &&
          doc.url &&
          doc.url !== defaultDocumentImage
      ).length;
    } else {
      return 0; // Default case if usertype is not driver or customer
    }
  };

  const handlePreview = (index: number) => {
    setPreviewUrl(vehicleDocuments[index].url);
    setPreviewIndex(index);
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewIndex(null);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      const updatedDocuments = [...vehicleDocuments];
      updatedDocuments[index].url = newUrl;
      updatedDocuments[index].file = file; // Añadir el archivo para la subida

      setVehicleDocuments(updatedDocuments);
      setIsDirty(true);
    }
  };

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setFormData((prevState) => ({ ...prevState, profile_image: newUrl }));
      setSelectedProfileFile(file);
      setIsDirty(true);
    }
  };
  const uploadImage = async (files: File[], fileNames: string[]) => {
    const storage = getStorage();
    const uploadPromises = files.map((file, index) => {
      const uniqueFileName = `${fileNames[index]}`;
      const fileRef = storageRef(storage, `users/${user.id}/${uniqueFileName}`);
      return uploadBytes(fileRef, file).then(() => getDownloadURL(fileRef));
    });

    return Promise.all(uploadPromises);
  };

  const handleDeleteUser = async () => {
    try {
      await dispatch(deleteUser(user.id));
      onClose();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleDownloadPDF = () => {
    const carnetElement = document.getElementById("carnet");

    if (carnetElement) {
      // Encontrar todas las imágenes dentro del elemento del carnet
      const images = carnetElement.getElementsByTagName("img");
      const imagePromises = Array.from(images).map((img) => {
        return new Promise((resolve, reject) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = resolve;
            img.onerror = reject;
          }
        });
      });

      // Esperar hasta que todas las imágenes estén cargadas
      Promise.all(imagePromises)
        .then(() => {
          // Una vez que todas las imágenes estén cargadas, capturar el contenido
          html2canvas(carnetElement).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
              orientation: "portrait",
              unit: "px",
              format: [canvas.width, canvas.height],
            });
            pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
            pdf.save("carnet.pdf");
          });
        })
        .catch((error) => {
          console.error("Error loading images:", error);
        });
    }
  };

  const handleSwitchChange = (checked: boolean, field: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: checked,
    }));
    setIsDirty(true);
  };
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleSaveVehicle = (newVehicle) => {
    // Aquí puedes manejar el vehículo recién creado.
    console.log("Vehículo guardado:", newVehicle);
  };
  // Función auxiliar para renderizar el Resultado
  // Función auxiliar para renderizar el Resultado

  const handleSecurityCheck = async () => {
    console.log("Verificando seguridad...");
    // Mostrar mensaje de que la verificación está en proceso
    let filteredData = formData2;

    Swal.fire({
      title: "Verificando antecedentes...",
      text: "Este proceso puede tardar varios minutos. Por favor, espera.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Validar si es un cliente para hacer la verificación de antecedentes
    if (
      formData.docType &&
      formData.verifyId &&
      formData.docType !== "" &&
      formData.docType !== null &&
      formData.docType !== undefined &&
      formData.verifyId !== "" &&
      formData.verifyId !== null &&
      formData.verifyId !== undefined
    ) {
      try {
        // Llamar a la verificación en el backend (POST request con axios)
        const response = await axios.post(
          "https://us-central1-treasupdate.cloudfunctions.net/getUserVerification",
          {
            doc_type: formData.docType,
            identification: formData.verifyId,
            name: formData.firstName + " " + formData.lastName,
            uid: formData.id,
          },
          {
            timeout: 300000, // 5 minutos de tiempo máximo para la solicitud
          }
        );

        const results = response.data;

        setData(results);

        // Procesar los resultados para verificar entidades con paso = '2' excepto 'simit'
        let blockedTopus = false;
        let blockedReasonTopus = [];

        results.forEach((item) => {
          if (item.entidad !== "simit" && item.paso === "2") {
            blockedTopus = true;
            blockedReasonTopus.push(item.entidad);
          }
        });

        filteredData = {
          ...filteredData,
          blockedTopus: blockedTopus,
          blockedReasonTopus: blockedReasonTopus,
          securityData: [
            {
              antecedents: results,
              date: Date.now(),
              verifyId: formData.verifyId,
              doc_type: formData.docType,
              firstName: formData.firstName,
              lastName: formData.lastName,
            },
          ],
        };

        const success = dispatch(updateUserWithoutAuth(filteredData));

        if (success) {
          Swal.close(); // Cerrar el modal de carga
          console.log(results);
        } else {
          Swal.fire(
            "¡Error!",
            "La verificación de antecedentes no se ha realizado correctamente.",
            "error"
          );
        }
      } catch (error) {
        console.error("Error en la verificación:", error);
        Swal.fire(
          "Error",
          "Ha ocurrido un error en la verificación de antecedentes. Por favor, intente nuevamente.",
          "error"
        );
        return; // Si hay un error, detener la ejecución
      }
    } else {
      Swal.fire(
        "¡Error!",
        "La verificación de antecedentes no se ha realizado correctamente. Consulte Cédula o TI.",
        "error"
      );
      return;
    }
  };
  const handleSecurityCheckReload = async () => {
    console.log("Verificando seguridad...");
    // Mostrar mensaje de que la verificación está en proceso
    let filteredData = formData2;

    Swal.fire({
      title: "Verificando antecedentes...",
      text: "Este proceso puede tardar varios minutos. Por favor, espera.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Validar si es un cliente para hacer la verificación de antecedentes
    if (formData.consulToken) {
      try {
        // Llamar a la verificación en el backend (POST request con axios)
        const response = await axios.post(
          "https://us-central1-treasupdate.cloudfunctions.net/getuserdata",
          {
            data: formData.consulToken,
          }
        );

        const results = response.data;

        setData(results);

        // Procesar los resultados para verificar entidades con paso = '2' excepto 'simit'
        let blockedTopus = false;
        let blockedReasonTopus = [];

        results.forEach((item) => {
          if (item.entidad !== "simit" && item.paso === "2") {
            blockedTopus = true;
            blockedReasonTopus.push(item.entidad);
          }
        });

        // Actualizar filteredData con los nuevos campos
        filteredData = {
          ...filteredData,
          blockedTopus: blockedTopus,
          blockedReasonTopus: blockedReasonTopus,
          securityData: {
            "0": {
              antecedents: results,
              date: Date.now(),
              verifyId: formData.verifyId,
              doc_type: formData.docType,
              firstName: formData.firstName,
              lastName: formData.lastName,
            },
            consulToken: formData.consulToken,
          },
        };

        const success = dispatch(updateUserWithoutAuth(filteredData));

        if (success) {
          Swal.close(); // Cerrar el modal de carga
          console.log(results);
        } else {
          Swal.fire(
            "¡Error!",
            "La verificación de antecedentes no se ha realizado correctamente.",
            "error"
          );
        }
      } catch (error) {
        console.error("Error en la verificación:", error);
        Swal.fire(
          "Error",
          "Ha ocurrido un error en la verificación de antecedentes. Por favor, intente nuevamente.",
          "error"
        );
        return; // Si hay un error, detener la ejecución
      }
    } else {
      Swal.fire(
        "¡Error!",
        "La verificación de antecedentes no se ha realizado correctamente. Consulte el TOKEN.",
        "error"
      );
      return;
    }
  };


  const handleCancelMembership = async (membershipId: string) => {
    try {
      const result = await dispatch(cancelMembership(membershipId)).unwrap();
      // Actualiza el estado local después de cancelar la membresía
      setMemberships((prevMemberships) =>
        prevMemberships.map((membership) =>
          membership.uid === membershipId ? { ...membership, status: "CANCELADA", fecha_terminada: result.fecha_terminada } : membership
        )
      );
      Swal.fire("¡Éxito!", "La membresía ha sido cancelada.", "success");
    } catch (error) {
      console.error("Error cancelando la membresía:", error);
      Swal.fire("Error", "Hubo un problema al cancelar la membresía.", "error");
    }
  };


  // ... código existente ...

const handleCreateMembership = async () => {
  // Aquí puedes definir los datos necesarios para la nueva membresía
  const newMembershipData = {
    uid: user.id, // ID del usuario
    costo: 96000, // Costo de la membresía (ajusta según sea necesario)
  };

  try {
    // Aquí puedes hacer la llamada a la API o la acción de Redux para crear la membresía
    const result = await dispatch(createMembership(newMembershipData)).unwrap(); // Asegúrate de tener la acción `createMembership` definida en tu slice

    // Actualiza el estado local si es necesario
    setMemberships((prevMemberships) => [...prevMemberships, result]);

    // Muestra un mensaje de éxito
    Swal.fire("¡Éxito!", "La membresía ha sido creada.", "success");
  } catch (error) {
    console.error("Error creando la membresía:", error);
    Swal.fire("Error", "Hubo un problema al crear la membresía.", "error");
  }
};

// ... código existente ...

  // Dentro de EditUserModal

  const renderResultado = (data) => {
    if (Array.isArray(data)) {
      return (
        <ul className="list-disc list-inside">
          {data.map((item, index) => (
            <li key={index}>{renderResultado(item)}</li>
          ))}
        </ul>
      );
    } else if (typeof data === "object" && data !== null) {
      return (
        <div className="space-y-1">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex">
              <span className="font-medium mr-2">{key}:</span>
              <span>{renderResultado(value)}</span>
            </div>
          ))}
        </div>
      );
    } else {
      return <span>{data.toString()}</span>;
    }
  };

  const renderAccountDetails = () => {
    if (user.usertype === "company") {
      return (
        <>
          <div className="mb-4">
            <label className="block text-gray-700">Nombre de la Empresa</label>
            <input
              type="text"
              name="bussinesName"
              value={formData.bussinesName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">NIT</label>
            <input
              type="text"
              name="NIT"
              value={formData.NIT}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Comisión</label>
            <input
              type="text"
              name="commission"
              value={formData.commission}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700">Nombres</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              />
            </div>
            <div>
              <label className="block text-gray-700">Apellidos</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              />
            </div>
          </div>
          {user.usertype === "driver" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700">Vehículo</label>
                <input
                  type="text"
                  name="vehicleMake"
                  value={formData.vehicleMake}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">
                  Modelo del Vehículo
                </label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Número de Placa</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Kilometros</label>
                <input
                  type="text"
                  name="kilometers"
                  value={formData.kilometers}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </div>
            </>
          )}
        </>
      );
    }
  };


  const renderContent = () => {
    switch (selectedOption) {
      case "accountDetails":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Detalles de la Cuenta</h2>
            <div className="flex items-center mb-4">
              <img
                src={formData.profile_image || defaultProfileImage}
                alt="Avatar"
                className="w-24 h-24 rounded-full shadow-2xl"
              />
              <div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleProfileFileChange}
                  id="profileImageUpload"
                />
                <label
                  htmlFor="profileImageUpload"
                  className="px-4 py-2 bg-gray-200 rounded-lg mr-2 cursor-pointer"
                >
                  Seleccionar archivo
                </label>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4 text-red_treas">
              UID: {formData.id}
            </h2>
            <form className="overflow-y-auto max-h-[calc(100vh-200px)]">
              {renderAccountDetails()}
              <div className="mb-4">
                <label className="block text-gray-700">Billetera</label>
                <input
                  type="text"
                  name="walletBalance"
                  value={formData.walletBalance}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </div>
              {user.usertype !== "company" && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700">
                      Tipo de Documento
                    </label>
                    <select
                      name="docType"
                      value={formData.docType}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded mt-1"ls2UQaJYsbbNPiSNih7yKGLpxTj2
                    >
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Cédula</label>
                    <input
                      type="text"
                      name="verifyId"
                      value={formData.verifyId}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded mt-1"
                    />
                  </div>
                </>
              )}
              <div className="mb-4">
                <label className="block text-gray-700">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={true}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {user.usertype === "driver" && (
                  <div>
                    <label className="block text-gray-700">Direccion</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.addres}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded mt-1"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-gray-700">Ciudad</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded mt-1"
                  >
                    <option value="" disabled>
                      Selecciona una ciudad
                    </option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700">Telefono</label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded mt-1"
                  />
                </div>
                {user.usertype === "driver" && (
                  <div>
                    <label className="block text-gray-700">Daviplata</label>
                    <input
                      type="number"
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Observaciones</label>
                <input
                  type="text"
                  name="Observations"
                  value={formData.Observations}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </div>
              {user.usertype === "driver" && (
                <div className="mb-4">
                  <label className="block text-gray-700">
                    Gestion de Usuario
                  </label>
                  <select
                    name="validContac"
                    value={formData.validContac || ""}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded mt-1"
                  >
                    <option value="Contactado">Contactado</option>
                    <option value="No interesado / No aplica ">
                      No interesado / No aplica{" "}
                    </option>
                    <option value="Falta Documentación / Información">
                      Falta Documentación / Información
                    </option>
                    <option value="Completado con Recarga">
                      Completado con Recarga
                    </option>
                    <option value="Completado sin Recarga">
                      Completado sin Recarga
                    </option>
                    <option value="No contesta'">No contesta'</option>
                    <option value="Nuevo">Nuevo</option>
                    <option value="Número equivocado">Número equivocado</option>
                    <option value="Recarga Incompleta">
                      Recarga Incompleta
                    </option>
                    <option value="Verificado sin vehículo">
                      Verificado sin vehículo
                    </option>
                    <option value="No volver a llamar">
                      No volver a llamar
                    </option>
                    <option value="No contesta">No contesta</option>
                  </select>
                </div>
              )}
              {user.usertype === "customer" && (
                <div className="mb-4">
                  <label className="block text-gray-700">Empresa</label>
                  <select
                    name="company"
                    value={formData.company || ""}
                    onChange={(e) => {
                      const selectedCompany = filteredUsers.find(
                        (company) => company.id === e.target.value
                      );
                      console.log("Selected Company:", selectedCompany);
                      if (selectedCompany) {
                        setFormData((prevState) => ({
                          ...prevState,
                          company: selectedCompany.id,
                          bussinesName: selectedCompany.bussinesName,
                        }));
                      } else {
                        setFormData((prevState) => ({
                          ...prevState,
                          company: "",
                          bussinesName: "",
                        }));
                      }
                      setIsDirty(true);
                    }}
                    className="w-full p-2 border border-gray-300 rounded mt-1"
                    authState={authState.usertype === "company"} // Deshabilitar si el rol es 'company'
                  >
                    <option value="">Sin empresa</option>{" "}
                    {/* Opción para seleccionar sin empresa */}
                    <option value="" disabled>
                      Seleccionar una empresa...
                    </option>
                    {filteredUsers.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.bussinesName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {referrerName && (
                <div className="mb-4">
                  <label className="block text-gray-700">Referido por</label>
                  <input
                    type="text"
                    name="signupViaReferral"
                    value={referrerName}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded mt-1 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              )}
              {isUpdateUser && (
                <div className="mb-4 flex items-center">
                  <label className="block text-gray-700 mr-4">Revisado</label>
                  <Switch
                    onChange={(checked) =>
                      handleSwitchChange(checked, "reviewed")
                    }
                    checked={formData.reviewed}
                    onColor="#ff0000" // Color rojo
                  />
                </div>
              )}
              {user.usertype === "driver" && (
                <>
                  {" "}
                  <div className="mb-4 flex items-center">
                    <label className="block text-gray-700 mr-4">
                      Bloqueado
                    </label>
                    <Switch
                      onChange={(checked) =>
                        handleSwitchChange(checked, "blocked")
                      }
                      checked={formData.blocked}
                      onColor="#ff0000"
                    />
                  </div>
                  <div className="mb-4 flex items-center">
                    <label className="block text-gray-700 mr-4">Ocupado</label>
                    <Switch
                      onChange={(checked) =>
                        handleSwitchChange(checked, "queue")
                      }
                      checked={formData.queue}
                      onColor="#ff0000"
                    />
                  </div>
                </>
              )}
              {user.usertype === "driver" && (
                <>
                  <div className="mb-4 flex items-center">
                    <label className="block text-gray-700 mr-4">
                      Cantidad de documentos
                    </label>
                    <p>{`Cantidad de documentos válidos: ${countValidDocuments()}`}</p>
                  </div>
                </>
              )}

              {user.usertype === "customer" && (
                <>
                  <div className="mb-4 flex items-center">
                    <label className="block text-gray-700 mr-4">
                      Cantidad de documentos
                    </label>
                    <p>{`Cantidad de documentos válidos: ${countValidDocuments()}`}</p>
                  </div>
                </>
              )}
              {user.usertype === "company" && (
                <div className="mb-4 flex items-center">
                  <label className="block text-gray-700 mr-4">
                    Habilitar sub Usuarios
                  </label>
                  <Switch
                    onChange={(checked) =>
                      handleSwitchChange(checked, "AccessSubUsers")
                    }
                    checked={formData.AccessSubUsers}
                    onColor="#ff0000"
                  />
                </div>
              )}
            </form>
            <label className="block text-gray-700">Referido por</label>
            <input
              type="text"
              name="signupViaReferral"
              value={formData.signupViaReferral || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded mt-1 bg-gray-100 cursor-not-allowed"
            />
          </div>
        );
      case "document":
        return (
          <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <h2 className="text-2xl font-bold text-center p-4 text-red_treas">
              Documento
            </h2>
            <div
              className="relative w-full h-96"
              onClick={() => setShowImageModal(true)}
            >
              <img
                src={formData.verifyIdImage || defaultDocumentImage}
                alt="Card ID"
                className="absolute top-0 left-0 w-full h-full object-cover rounded-md cursor-pointer"
              />
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-4">
                <div className="text-center text-black">
                  {/* Aquí puedes añadir más información o detalles adicionales si es necesario */}
                </div>
              </div>
            </div>

            {showImageModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
                <div className="relative bg-white rounded-lg shadow-lg p-4 max-w-xl w-full max-h-[90vh] overflow-y-auto">
                  <img
                    src={formData.verifyIdImage || defaultDocumentImage}
                    alt="Document Preview"
                    className="w-full h-auto rounded-lg shadow-lg mb-4"
                  />
                  <div className="flex justify-between mt-4">
                    <a
                      href={formData.verifyIdImage || defaultDocumentImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red_treas hover:bg-red-300 text-white px-4 py-2 rounded-full"
                    >
                      Abrir en una nueva pestaña
                    </a>
                    <button
                      onClick={() => setShowImageModal(false)}
                      className="bg-gray-900 text-white px-4 py-2 rounded-full ml-4"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "viajes":
        return (
          <div className="overflow-y-auto max-h-[calc(100vh-200px)] h-full">
            <h2 className="text-2xl font-bold mb-4">Historial de Viajes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userBookings.map((booking) => (
                <CardCorp key={booking.uid} {...booking} />
              ))}
            </div>
          </div>
        );
      case "billetera":
        return (
          <div className="text-white p-6 rounded-lg overflow-y-auto max-h-[calc(100vh-200px)]">
            <h2 className="text-xl font-bold mb-4 text-black">
              Balance de la Billetera
            </h2>
            <h3 className="text-4xl font-bold mb-2 text-red_treas">
              {formData.walletBalance}
            </h3>
            <p className="text-green-500 mb-4">+ $3968.00</p>
            <div className="flex justify-between mb-4">
              <div className="bg-red-600 p-4 rounded-lg flex-1 mr-2">
                <h4 className="text-sm">Revenues</h4>
                <p className="text-lg font-bold">$890.30</p>
                <p className="text-sm">0.60%</p>
              </div>
              <div className="bg-red-900 p-4 rounded-lg flex-1 mr-2">
                <h4 className="text-sm">Expenses</h4>
                <p className="text-lg font-bold">$267.89</p>
                <p className="text-sm">0.30%</p>
              </div>
              <div className="bg-red-300 p-4 rounded-lg flex-1">
                <h4 className="text-sm">Savings</h4>
                <p className="text-lg font-bold">$138.00</p>
                <p className="text-sm">2.58%</p>
              </div>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2 mb-4">
              <button className="flex-1 text-center text-black">
                Activities
              </button>
              <button className="flex-1 text-center text-black">
                Statistics
              </button>
              <button className="flex-1 text-center text-black">Summary</button>
            </div>
            <div className="space-y-2">
              {history.map((entry) => (
                <div className="flex justify-between" key={entry.id}>
                  <p className="text-black">{entry.txRef}</p>
                  <p className="text-black">{entry.type}</p>
                  <p className="text-black">
                    {entry.type === "Credit" ? "+" : "-"} ${entry.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      
        case "carnet":
        return (
          <div>
            <div
              className="relative w-full h-auto"
              style={{ paddingTop: "196%" }}
            >
              <h2 className="text-2xl font-bold mb-4">Carnet</h2>
              <div
                id="carnet"
                className="absolute top-0 left-0 w-full h-full bg-cover bg-center rounded-md"
                style={{ backgroundImage: `url(${CarnetCustomer})` }}
              >
                <div className="flex flex-col h-full justify-center">
                  <div className="flex justify-end">
                    <div className="relative right-14 bottom-36 m-4">
                      <img
                        src={formData.profile_image || defaultProfileImage}
                        alt="Avatar"
                        className="w-44 h-44 rounded-full shadow-2xl  top-2"
                      />
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="relative left-14">
                      <h2 className="text-black font-bold text-2xl">
                        {formData.firstName} {formData.lastName}
                      </h2>
                      <h2 className="text-black text-2xl font-bold">
                        {formData.email}
                      </h2>
                      <h2 className="text-black font-bold text-2xl">
                        {formData.mobile}
                      </h2>
                      <h2 className="text-black font-bold text-2xl">
                        {formData.referer}
                      </h2>
                      <h2 className="text-black font-bold text-2xl">
                        {formData.docType} {formData.verifyId}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleDownloadPDF}
                className="bg-red_treas hover:bg-red-700 text-white px-4 py-2 rounded-full"
              >
                Descargar Carnet como PDF
              </button>
            </div>
          </div>
        );

      case "vehicleDocuments":
        return (
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <h2 className="text-2xl font-bold mb-4">Documentos del Vehículo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicleDocuments.slice(0, 7).map((doc, index) => (
                <div key={index} className="relative w-full h-96">
                  <div
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                    onClick={() => handlePreview(index)}
                  >
                    <img
                      src={doc.url}
                      alt={doc.name}
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-md cursor-pointer"
                    />
                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-4">
                      <p className="absolute top-0 left-0 m-4 text-black bg-white p-2 rounded">
                        {doc.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cars.length > 1 && (
              <>
                <h3 className="text-xl font-bold mt-8 mb-4 text-gray-700">
                  Segundo Vehículo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicleDocuments.slice(7).map((doc, index) => (
                    <div key={index} className="relative w-full h-96">
                      <div
                        className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                        onClick={() => handlePreview(index + 7)}
                      >
                        <img
                          src={doc.url}
                          alt={doc.name}
                          className="absolute top-0 left-0 w-full h-full object-cover rounded-md cursor-pointer"
                        />
                        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-4">
                          <p className="absolute top-0 left-0 m-4 text-black bg-white p-2 rounded">
                            {doc.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {previewUrl && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="relative bg-white rounded-md p-4 max-w-lg mx-auto">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto rounded-md mb-4"
                  />
                  <div className="flex justify-between">
                    <button
                      onClick={closePreview}
                      className="text-white bg-red-500 px-4 py-2 rounded"
                    >
                      Cancelar
                    </button>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, previewIndex!)}
                      className="text-white px-4 py-2 rounded"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "vehicles":
        return (
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Vehículos</h2>
              <button
                onClick={openModal}
                className="text-white bg-red_treas hover:bg-red-700 p-2 rounded-full"
              >
                <FaPlusCircle size={24} /> {/* Botón con el ícono */}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {loading && <div>Cargando...</div>}
              {cars.map((car) => (
                <VehicleCard
                  key={car.id}
                  vehicle={car}
                  userId={formData.id}
                  onUpdateUser={(updatedUser) =>
                    setFormData((prevState) => ({
                      ...prevState,
                      ...updatedUser,
                    }))
                  }
                />
              ))}
            </div>
          </div>
        );
 // Modificar el caso "direcciones" en la función renderContent
 case "direcciones":
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Direcciones guardadas</h2>
      {formData.savedAddresses && Object.keys(formData.savedAddresses).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {Object.entries(formData.savedAddresses).map(([key, address]) => (
            <div key={key} className="bg-white rounded-lg shadow-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">{address.nameAddressFavorite || address.typeAddress}</h3>
                <p className="text-gray-500">{address.description}</p>
                <p className="text-gray-500">Latitud: {address.lat}</p>
                <p className="text-gray-500">Longitud: {address.lng}</p>
                <span className="text-red-500">
                  {address.isFavorite ? '★' : '☆'}
                </span>
              </div>
              <button
                onClick={() => handleDeleteAddress(key)}
                className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay direcciones guardadas.</p>
      )}
    </div>
  );
        
      case "contrats":
        return (
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <h2 className="text-2xl font-bold mb-4">Contratos</h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {cars.length > 0 ? (
                <ContractDisplay auth={formData} car={cars} />
              ) : (
                <div className="text-center text-red-600 font-semibold">
                  <img
                    src={noVehiclesImage}
                    alt="No Vehicles"
                    className="mx-auto mb-4 w-48 h-48"
                  />
                  Por favor, crea un vehículo para poder visualizar el contrato.
                </div>
              )}
            </div>
          </div>
        );
      case "consultaTopus":
        return (
          <div className="overflow-y-auto max-h-[calc(100vh-200px)] h-full p-6 bg-gray-100">
            <h2 className="text-3xl font-bold mb-6 text-center text-red-600">
              Consulta de Seguridad
            </h2>
            {formData?.securityData &&
            Object.keys(formData.securityData).length > 0 ? (
              Object.entries(formData.securityData)
                .filter(([key]) => key !== "consulToken")
                .map(([key, securityItem], index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-lg p-6 mb-8"
                  >
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-red-600">
                          {securityItem.firstName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-semibold">
                          {securityItem.firstName} {securityItem.lastName}
                        </h3>
                        <p className="text-gray-500">
                          Documento: {securityItem.verifyId}
                        </p>
                      </div>
                    </div>

                    {securityItem.antecedents?.length > 0 ? (
                      <div className="space-y-6">
                        {securityItem.antecedents.map((antecedent, idx) => (
                          <div key={idx} className="border-t pt-4">
                            <div className="flex items-center mb-2">
                              <h4 className="text-lg font-semibold flex-grow">
                                {antecedent.entidad.charAt(0).toUpperCase() +
                                  antecedent.entidad.slice(1)}
                              </h4>
                              {antecedent.hecho === "1" ? (
                                <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-600">
                                  Con Informacion Obtenida
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-sm rounded-full bg-red-100 text-reed-600">
                                  Sin antecedentes
                                </span>
                              )}
                            </div>

                            {antecedent.respuesta ? (
                              <div className="mt-2 text-gray-700">
                                {renderResultado(antecedent.respuesta)}
                              </div>
                            ) : (
                              <p className="text-gray-500">
                                No hay respuesta disponible.
                              </p>
                            )}

                            {antecedent.archivo_evidencia && (
                              <div className="mt-2">
                                <a
                                  href={antecedent.archivo_evidencia}
                                  className="text-blue-600 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Ver Evidencia
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No hay antecedentes disponibles.
                      </p>
                    )}

                    <>
                      <button
                        onClick={handleSecurityCheckReload}
                        className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded mt-4"
                      >
                        Volver a Consultar
                      </button>
                    </>
                  </div>
                ))
            ) : (
              <>
                <button
                  onClick={handleSecurityCheck}
                  className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Generar Consulta
                </button>
                <p className="text-center text-gray-500">
                  No hay datos de seguridad disponibles.
                </p>
              </>
            )}
            {formData?.consulToken && !formData?.securityData && (
              <div className="text-center mt-4">
                <button
                  onClick={handleSecurityCheckReload}
                  className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Volver a Consultar
                </button>
              </div>
            )}
          </div>
        );

        case "Membresia":
          return (
            <div className="overflow-y-auto max-h-[calc(100vh-200px)] h-full p-6 bg-gray-100">
              <h2 className="text-3xl font-bold mb-6 text-center text-red-600">
                Historial de Membresías
              </h2>
              {memberships.length > 0 ? (
                <ul>
                  {memberships.map((membership, index) => (
                    <li key={index} className="mb-4 p-4 bg-white rounded shadow">
                      <p><strong>ID:</strong> {membership.uid}</p>
                      <p><strong>Estado:</strong>   <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-600">  {membership.status} </span> </p>
                      <p><strong>Monto:</strong> ${membership.costo}</p>
                      <p><strong>Fecha de Inicio:</strong> {membership.fecha_inicio}</p>
                      <p><strong>Fecha de Fin:</strong> {membership.fecha_terminada}</p>
                      <p><strong>Periodo:</strong> {membership.periodo} Días</p>
                      {membership.status !== "CANCELADA" && (
                        <button
                          onClick={() => handleCancelMembership(membership.uid)}
                          className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded mt-2"
                        >
                          Cancelar Membresía
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <p>No se encontraron membresías.</p>
                  <button
                    onClick={handleCreateMembership} // Asegúrate de definir esta función
                    className="bg-red_treas hover:bg-red-700 text-white px-4 py-2 rounded mt-4"
                  >
                    Crear Nueva Membresía
                  </button>
                </>
              )}
            </div>
          );
      default:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Select an option</h2>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-lg shadow-lg w-full ${
          selectedOption === "viajes" ? "max-w-6xl" : "max-w-4xl"
        } h-full max-h-[90vh] overflow-hidden`}
      >
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-1/4 bg-gray-100 p-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Detalles de Usuarios</h2>
            <ul>
              <li className="mb-2">
                <button
                  onClick={() => setSelectedOption("accountDetails")}
                  className={`w-full text-left p-2 rounded-lg ${
                    selectedOption === "accountDetails"
                      ? "bg-red_treas text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  Detalles del Usuario
                </button>
              </li>
              {user.usertype === "customer" && (
                <li className="mb-2">
                  <button
                    onClick={() => setSelectedOption("document")}
                    className={`w-full text-left p-2 rounded-lg ${
                      selectedOption === "document"
                        ? "bg-red_treas text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    Documento
                  </button>
                </li>
              )}
              {user.usertype === "driver" && (
                <>
                  <li className="mb-2">
                    <button
                      onClick={() => setSelectedOption("vehicleDocuments")}
                      className={`w-full text-left p-2 rounded-lg ${
                        selectedOption === "vehicleDocuments"
                          ? "bg-red_treas text-white"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      Documentos del Vehículo
                    </button>
                  </li>
                  <li className="mb-2">
                    <button
                      onClick={() => setSelectedOption("vehicles")}
                      className={`w-full text-left p-2 rounded-lg ${
                        selectedOption === "vehicles"
                          ? "bg-red_treas text-white"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      Vehículos
                    </button>
                  </li>
                  <li className="mb-2">
                    <button
                      onClick={() => setSelectedOption("contrats")}
                      className={`w-full text-left p-2 rounded-lg ${
                        selectedOption === "contrats"
                          ? "bg-red_treas text-white"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      Contrato
                    </button>
                  </li>
                </>
              )}
              <li className="mb-2">
                <button
                  onClick={() => setSelectedOption("viajes")}
                  className={`w-full text-left p-2 rounded-lg ${
                    selectedOption === "viajes"
                      ? "bg-red_treas text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  Viajes
                </button>
              </li>
              {user.usertype === "customer" && (
                <li className="mb-2">
                  <button
                    onClick={() => setSelectedOption("direcciones")}
                    className={`w-full text-left p-2 rounded-lg ${
                      selectedOption === "document"
                        ? "bg-red_treas text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    Direcciones guardadas
                  </button>
                </li>
              )}
              <li className="mb-2">
                <button
                  onClick={() => setSelectedOption("billetera")}
                  className={`w-full text-left p-2 rounded-lg ${
                    selectedOption === "billetera"
                      ? "bg-red_treas text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  Billetera
                </button>
              </li>
              <li className="mb-2">
                <button
                  onClick={() => setSelectedOption("carnet")}
                  className={`w-full text-left p-2 rounded-lg ${
                    selectedOption === "carnet"
                      ? "bg-red_treas text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  Carnet
                </button>
              </li>
              {authState.usertype === "admin" && (
                <li className="mb-2">
                  <button
                    onClick={() => setSelectedOption("consultaTopus")}
                    className={`w-full text-left p-2 rounded-lg ${
                      selectedOption === "consultaTopus"
                        ? "bg-red_treas text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    Consulta Topus
                  </button>
                </li>
              )}
              {authState.usertype === "admin" && (
                <li className="mb-2">
                  <button
                    onClick={() => setSelectedOption("Membresia")}
                    className={`w-full text-left p-2 rounded-lg ${
                      selectedOption === "Membresia"
                        ? "bg-red_treas text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    Membresia
                  </button>
                </li>
              )}
              {authState.usertype === "admin" && (
                <li className="mt-4">
                  <button
                    className="w-full text-left p-2 bg-red-500 text-white rounded-lg"
                    onClick={() => setShowDeleteConfirmation(true)}
                  >
                    Eliminar Usuario
                  </button>
                </li>
              )}
            </ul>
          </div>
          <div className="w-full md:w-3/4 p-4 overflow-y-auto max-h-full">
            {renderContent()}
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-2xl mr-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmationModal(true)}
                disabled={!isDirty}
                className={`px-4 py-2 rounded-2xl ${
                  isDirty
                    ? "bg-red_treas text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de guardado */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Confirmar cambios</h2>
            <p>¿Estás seguro de que deseas realizar estos cambios?</p>
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded mr-2"
                onClick={() => setShowConfirmationModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red_treas hover:bg-red-700 text-white px-4 py-2 rounded"
                onClick={() => {
                  handleSaveClick();
                  setShowConfirmationModal(false);
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-600 bg-opacity-75">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Confirmar eliminación</h2>
            <p>
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no
              se puede deshacer.
            </p>
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded mr-2"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red_treas hover:bg-red-700 text-white px-4 py-2 rounded"
                onClick={handleDeleteUser}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <SuccessModal onClose={() => setShowSuccessModal(false)} />
      )}
      {showErrorModal && (
        <ErrorModal onClose={() => setShowErrorModal(false)} />
      )}
      {isModalOpen && (
        <CreateVehicleModal
          onClose={closeModal}
          onSave={(newVehicle) => handleSaveVehicle(newVehicle)}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default EditUserModal;
