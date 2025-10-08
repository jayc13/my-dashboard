import { Button } from '@mui/material';

export interface AddPRButtonProps {
  onClick: () => void;
}

const AddPRButton = ({ onClick }: AddPRButtonProps) => {
  return (
    <Button variant="contained" color="primary" onClick={onClick} data-testid="add-pr-button">
      Add Pull Request
    </Button>
  );
};

export default AddPRButton;
