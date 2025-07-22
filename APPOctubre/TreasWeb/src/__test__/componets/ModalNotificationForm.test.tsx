import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ModalNotificationForm from '../../components/ModalNotificationForm';

describe('ModalNotificationForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renderiza correctamente todos los campos y botones', () => {
    render(<ModalNotificationForm onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    // Verificar la presencia de los campos del formulario
    expect(screen.getByLabelText('Título')).toBeInTheDocument();
    expect(screen.getByLabelText('Mensaje')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de Celular')).toBeInTheDocument();

    // Verificar la presencia de los botones
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('cierra el modal al hacer clic en "Cancelar"', () => {
    render(<ModalNotificationForm onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('envía los datos correctos al enviar el formulario', async () => {
    render(<ModalNotificationForm onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    // Simular la entrada del usuario
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Test Body' } });
    fireEvent.change(screen.getByLabelText('Tipo de Usuario'), { target: { value: 'client' } });
    fireEvent.change(screen.getByLabelText('Tipo de Celular'), { target: { value: 'IOS' } });

    const sendButton = screen.getByTestId('submit-button');
    fireEvent.click(sendButton);

    // Envolver la ejecución de los temporizadores en act
    await act(async () => {
      jest.runAllTimers();
    });

    // Esperar a que se llamen las funciones mock
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Test Title', 'Test Body', 'client', 'IOS');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  test('muestra el estado de envío mientras se procesa el formulario', async () => {
    render(<ModalNotificationForm onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    // Simular la entrada del usuario
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Test Body' } });
    fireEvent.change(screen.getByLabelText('Tipo de Usuario'), { target: { value: 'client' } });
    fireEvent.change(screen.getByLabelText('Tipo de Celular'), { target: { value: 'IOS' } });

    const sendButton = screen.getByTestId('submit-button');
    fireEvent.click(sendButton);

    // Verificar que el botón está deshabilitado durante la sumisión
    expect(sendButton).toBeDisabled();
    expect(sendButton).toHaveTextContent('Enviando...');

    // Envolver la ejecución de los temporizadores en act
    await act(async () => {
      jest.runAllTimers();
    });

    // Esperar a que el botón no esté deshabilitado
    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
      expect(sendButton).toHaveTextContent('Send');
    });
  });
});