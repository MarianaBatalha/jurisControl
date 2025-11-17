import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Header from './Header';
import { Button } from './ui/Button';
import { fn } from '@storybook/test';

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => <div className="p-8"><Story /></div>,
  ]
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    title: 'Page Title',
    subtitle: 'A brief and informative subtitle for the page.',
  },
};

export const WithAction: Story = {
  args: {
    title: 'Gestão de Processos',
    subtitle: 'Cadastro e acompanhamento de processos trabalhistas',
    children: (
        <Button onClick={fn()}>
            + Novo Processo
        </Button>
    )
  },
};