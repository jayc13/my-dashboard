import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
} from '@mui/material';
import type { Application } from '@/types';

export interface AppDialogProps {
    open: boolean;
    editingApp: Application | null;
    formData: Partial<Application>;
    isCreating: boolean;
    isUpdating: boolean;
    onClose: () => void;
    onSubmit: () => Promise<void>;
    onFormDataChange: (data: Partial<Application>) => void;
}

const AppDialog = (props: AppDialogProps) => {
    const { open, editingApp, formData, isCreating, isUpdating, onClose, onSubmit, onFormDataChange } = props;

    const isLoading = isCreating || isUpdating;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth data-testid="app-dialog">
            <DialogTitle>{editingApp ? 'Edit App' : 'Add New App'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={formData.name || ''}
                            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                            required
                            data-testid="app-name-input"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Code"
                            value={formData.code || ''}
                            onChange={(e) => onFormDataChange({ ...formData, code: e.target.value })}
                            required
                            helperText="Unique identifier for the app"
                            data-testid="app-code-input"
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Pipeline URL"
                            value={formData.pipelineUrl || ''}
                            onChange={(e) => onFormDataChange({ ...formData, pipelineUrl: e.target.value })}
                            helperText="Optional URL to the CI/CD pipeline"
                            data-testid="app-pipeline-url-input"
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="E2E Trigger Configuration"
                            value={formData.e2eTriggerConfiguration || ''}
                            onChange={(e) =>
                                onFormDataChange({ ...formData, e2eTriggerConfiguration: e.target.value })
                            }
                            multiline
                            rows={10}
                            helperText="Optional JSON configuration for E2E test triggers"
                            placeholder='{"environment": "staging", "browser": "chrome"}'
                            data-testid="app-e2e-config-input"
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.watching || false}
                                    onChange={(e) =>
                                        onFormDataChange({ ...formData, watching: e.target.checked })
                                    }
                                    color="primary"
                                    data-testid="app-watching-switch"
                                />
                            }
                            label="Watching"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isLoading} data-testid="app-cancel-button">
                    Cancel
                </Button>
                <Button onClick={onSubmit} variant="contained" disabled={isLoading} data-testid="app-submit-button">
                    {editingApp ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AppDialog;

