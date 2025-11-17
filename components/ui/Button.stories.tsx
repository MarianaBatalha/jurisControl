import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { ICONS } from '../../constants';
import { fn } from '@storybook/test';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'success', 'destructive', 'outline', 'primary-ghost', 'destructive-ghost'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'icon-sm'],
    },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: {
    isLoading: false,
    disabled: false,
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    children: (
      <>
        <ICONS.Save className="w-4 h-4" />
        Save
      </>
    ),
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'I should not be visible',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button',
  },
};

export const DestructiveGhostIcon: Story = {
    args: {
        variant: 'destructive-ghost',
        size: 'icon-sm',
        children: <ICONS.Trash className="w-5 h-5"/>
    }
}