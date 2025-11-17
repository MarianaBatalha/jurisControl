import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, fn } from '@storybook/test';
import ConfirmationModal from './ConfirmationModal';
import { Button } from './ui/Button';

const meta: Meta<typeof ConfirmationModal> = {
  title: 'Components/ConfirmationModal',
  component: ConfirmationModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onClose: fn(),
    onConfirm: fn(),
    title: 'Confirmar Exclusão',
    message: 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
    confirmText: 'Excluir',
    cancelText: 'Cancelar',
    isConfirming: false,
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmationModal>;

export const Default: Story = {
  name: 'Visible State',
  args: {
    isOpen: true,
  },
};

export const LoadingState: Story = {
  name: 'Confirming (Loading) State',
  args: {
    isOpen: true,
    isConfirming: true,
  },
};


const InteractiveModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="min-h-48">
            <Button onClick={() => setIsOpen(true)}>Abrir Modal de Confirmação</Button>
            <ConfirmationModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={() => {
                    alert('Confirmed!');
                    setIsOpen(false);
                }}
                title="Confirmar Ação"
                message="Você tem certeza que deseja executar esta ação?"
                isConfirming={false}
            />
        </div>
    )
}

export const Interactive: Story = {
    name: 'Interactive Flow',
    render: () => <InteractiveModal />,
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement);
        const openButton = await canvas.getByRole('button', { name: /Abrir Modal de Confirmação/i });
        
        // Open the modal
        await userEvent.click(openButton);
        
        const confirmButton = await canvas.getByRole('button', { name: /Confirmar Ação/i })
        
        // Click the confirm button
        await userEvent.click(confirmButton);
    },
};