import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

export interface AddPRDialogProps {
  open: boolean;
  url: string;
  urlError: string | null;
  isAdding: boolean;
  onClose: () => void;
  onAdd: () => Promise<void>;
  onUrlChange: (url: string) => void;
}

const AddPRDialog = (props: AddPRDialogProps) => {
  const { open, url, urlError, isAdding, onClose, onAdd, onUrlChange } = props;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth data-testid="add-pr-dialog">
      <DialogTitle>Add Pull Request</DialogTitle>
      <DialogContent>
        <TextField
          label="GitHub Pull Request URL"
          value={url}
          onChange={e => onUrlChange(e.target.value)}
          fullWidth
          margin="normal"
          disabled={isAdding}
          error={!!urlError}
          helperText={urlError || 'Example: https://github.com/org/repo/pull/123'}
          data-testid="pr-url-input"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isAdding} data-testid="pr-cancel-button">
          Cancel
        </Button>
        <Button
          onClick={onAdd}
          variant="contained"
          color="primary"
          disabled={!url || isAdding}
          data-testid="pr-add-button"
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPRDialog;
