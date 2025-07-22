import React from 'react';

interface InputFieldProps {
  label: string;
  type: string;
  value: string;

}

const InputField: React.FC<InputFieldProps> = ({ label, type,value }) => {
  return (
    <div>
      <label className="block text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        readOnly // Si quieres que sean solo de lectura
      />
    </div>
  );
};

export default InputField;


