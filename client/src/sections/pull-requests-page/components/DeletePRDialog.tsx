import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

export interface DeletePRDialogProps {
  open: boolean;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const DeletePRDialog = (props: DeletePRDialogProps) => {
  const { open, isDeleting, onConfirm, onCancel } = props;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth data-testid="delete-pr-dialog">
      <DialogTitle>Delete Pull Request</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this pull request?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isDeleting} data-testid="pr-delete-cancel-button">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
          data-testid="pr-delete-confirm-button"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeletePRDialog;
