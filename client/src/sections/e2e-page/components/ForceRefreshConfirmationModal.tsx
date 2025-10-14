import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface ForceRefreshConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isRefetching: boolean;
}

const ForceRefreshConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  isRefetching,
}: ForceRefreshConfirmationModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid="force-refresh-confirmation-modal"
      aria-labelledby="force-refresh-dialog-title"
      aria-describedby="force-refresh-dialog-description"
    >
      <DialogTitle id="force-refresh-dialog-title">Force Regenerate Report?</DialogTitle>
      <DialogContent>
        <DialogContentText id="force-refresh-dialog-description">
          This will delete the existing report and regenerate it from scratch. This action cannot be
          undone. Are you sure you want to continue?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isRefetching} data-testid="force-refresh-cancel-button">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isRefetching}
          color="primary"
          variant="contained"
          data-testid="force-refresh-confirm-button"
          autoFocus
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForceRefreshConfirmationModal;
