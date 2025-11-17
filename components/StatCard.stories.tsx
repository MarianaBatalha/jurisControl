import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StatCard from './StatCard';
import { ICONS } from '../constants';

const meta: Meta<typeof StatCard> = {
  title: 'Components/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => <div className="w-72"><Story /></div>,
  ],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const TotalProcesses: Story = {
  args: {
    title: "Total de Processos",
    value: "152",
    subtext: "Todos os processos cadastrados",
    icon: <ICONS.Processes />,
    iconBgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    trendIcon: <ICONS.UpRightArrow />,
    to: "/processes",
  },
};

export const PendingPayments: Story = {
    args: {
        title: "Pagamentos Pendentes",
        value: "12",
        subtext: "3 em atraso hoje",
        icon: <ICONS.PendingPayments />,
        iconBgColor: "bg-orange-100",
        iconColor: "text-orange-600",
        trendIcon: <ICONS.UpRightArrow />,
        trendIconColor: 'text-orange-500',
        to: "/payments",
    }
}

export const NoLink: Story = {
    args: {
        title: "Valor Total Envolvido",
        value: "R$ 1.234.567,89",
        subtext: "Acordos e sentenças",
        icon: <ICONS.Payments />,
        iconBgColor: "bg-purple-100",
        iconColor: "text-purple-600",
        trendIcon: <ICONS.UpRightArrow />,
    }
}