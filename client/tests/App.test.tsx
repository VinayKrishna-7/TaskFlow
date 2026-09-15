import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../src/components/common/Button';
import { Badge } from '../src/components/common/Badge';
import { EmptyState } from '../src/components/common/EmptyState';

describe('TaskFlow Frontend Core Component Library', () => {
  it('renders Button with variants and handles loading state', () => {
    render(<Button isLoading={true}>Submit Task</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders Badge with correct status classes', () => {
    const { container } = render(<Badge variant="status" status="COMPLETED">Completed</Badge>);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-emerald-50');
  });

  it('renders EmptyState with call to action', () => {
    render(
      <EmptyState
        title="No Tasks Found"
        description="Create your first task to get started."
        actionText="Create Task"
        onAction={() => {}}
      />
    );
    expect(screen.getByText('No Tasks Found')).toBeInTheDocument();
    expect(screen.getByText('Create your first task to get started.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });
});