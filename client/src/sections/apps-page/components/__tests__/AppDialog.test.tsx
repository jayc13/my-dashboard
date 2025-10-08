import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AppDialog from '../AppDialog';
import type { Application } from '@/types';

describe('AppDialog', () => {
    const mockOnClose = vi.fn();
    const mockOnSubmit = vi.fn();
    const mockOnFormDataChange = vi.fn();

    const mockFormData: Partial<Application> = {
        name: 'Test App',
        code: 'test-app',
        pipelineUrl: 'https://example.com/pipeline',
        e2eTriggerConfiguration: '{"env": "test"}',
        watching: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders in create mode when editingApp is null', () => {
        render(
            <AppDialog
                open={true}
                editingApp={null}
                formData={{}}
                isCreating={false}
                isUpdating={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onFormDataChange={mockOnFormDataChange}
            />
        );
        
        expect(screen.getByText('Add New App')).toBeInTheDocument();
        expect(screen.getByTestId('app-submit-button')).toHaveTextContent('Create');
    });

    it('renders in edit mode when editingApp is provided', () => {
        const mockApp: Application = {
            id: '1',
            name: 'Existing App',
            code: 'existing-app',
            pipelineUrl: '',
            e2eTriggerConfiguration: '',
            watching: false,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
        };

        render(
            <AppDialog
                open={true}
                editingApp={mockApp}
                formData={mockApp}
                isCreating={false}
                isUpdating={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onFormDataChange={mockOnFormDataChange}
            />
        );
        
        expect(screen.getByText('Edit App')).toBeInTheDocument();
        expect(screen.getByTestId('app-submit-button')).toHaveTextContent('Update');
    });

    it('does not render when closed', () => {
        render(
            <AppDialog
                open={false}
                editingApp={null}
                formData={{}}
                isCreating={false}
                isUpdating={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onFormDataChange={mockOnFormDataChange}
            />
        );
        
        expect(screen.queryByTestId('app-dialog')).not.toBeInTheDocument();
    });

    it('displays form data correctly', () => {
        render(
            <AppDialog
                open={true}
                editingApp={null}
                formData={mockFormData}
                isCreating={false}
                isUpdating={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onFormDataChange={mockOnFormDataChange}
            />
        );

        const nameInput = screen.getByTestId('app-name-input').querySelector('input');
        const codeInput = screen.getByTestId('app-code-input').querySelector('input');
        const pipelineInput = screen.getByTestId('app-pipeline-url-input').querySelector('input');
        const e2eInput = screen.getByTestId('app-e2e-config-input').querySelector('textarea');
        const watchingSwitch = screen.getByTestId('app-watching-switch').querySelector('input');

        expect(nameInput).toHaveValue('Test App');
        expect(codeInput).toHaveValue('test-app');
        expect(pipelineInput).toHaveValue('https://example.com/pipeline');
        expect(e2eInput).toHaveValue('{"env": "test"}');
        expect(watchingSwitch).toBeChecked();
    });

    it('calls onFormDataChange when name input changes', () => {
        render(
            <AppDialog
                open={true}
                editingApp={null}
                formData={{}}
                isCreating={false}
                isUpdating={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onFormDataChange={mockOnFormDataChange}
            />
        );

        const nameInput = screen.getByTestId('app-name-input').querySelector('input')!;
        fireEvent.change(nameInput, { target: { value: 'New App' } });
        
        expect(mockOnFormDataChange).toHaveBeenCalledWith({ name: 'New App' });
    });

    it('calls onFormDataChange when code input changes', () => {
        render(
            <AppDialog
                open={true}
                editingApp={null}
                formData={{}}
                isCreating={false}
                isUpdating={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onFormDataChange={mockOnFormDataChange}
            />
        );

        const codeInput = screen.getByTestId('app-code-input').querySelector('input')!;
        fireEvent.change(codeInput, { target: { value: 'new-app' } });
        
        expect(mockOnFormDataChange).toHaveBeenCalledWith({ code: 'new-app' });
    });

    it('calls onFormDataChange when watching switch is toggled', () => {
        render(
            <AppDialog
                open={true}
                editingApp={null}
                formData={{ watching: false }}
                isCreating={false}
                isUpdating={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onFormDataChange={mockOnFormDataChange}
            />
        );

        const watchingSwitch = screen.getByTestId('app-watching-switch').querySelector('input')!;
        fireEvent.click(watchingSwitch);

        expect(mockOnFormDataChange).toHaveBeenCalledWith({ watching: true });
    });

    it('calls onClose when cancel button is clicked', () => {
        render(
            <AppDialog
                open={true}
                editingApp={null}
                formData={{}}
                isCreating={false}
                isUpdating={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onFormDataChange={mockOnFormDataChange}
            />
        );
        
        const cancelButton = screen.getByTestId('app-cancel-button');
        fireEvent.click(cancelButton);
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit when submit button is clicked', () => {
        render(
            <AppDialog
                open={true}
                editingApp={null}
                formData={{}}
                isCreating={false}
                isUpdating={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onFormDataChange={mockOnFormDataChange}
            />
        );
        
        const submitButton = screen.getByTestId('app-submit-button');
        fireEvent.click(submitButton);
        
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('disables buttons when creating', () => {
        render(
            <AppDialog
                open={true}
                editingApp={null}
                formData={{}}
                isCreating={true}
                isUpdating={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onFormDataChange={mockOnFormDataChange}
            />
        );
        
        expect(screen.getByTestId('app-cancel-button')).toBeDisabled();
        expect(screen.getByTestId('app-submit-button')).toBeDisabled();
    });

    it('disables buttons when updating', () => {
        render(
            <AppDialog
                open={true}
                editingApp={null}
                formData={{}}
                isCreating={false}
                isUpdating={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onFormDataChange={mockOnFormDataChange}
            />
        );
        
        expect(screen.getByTestId('app-cancel-button')).toBeDisabled();
        expect(screen.getByTestId('app-submit-button')).toBeDisabled();
    });
});

