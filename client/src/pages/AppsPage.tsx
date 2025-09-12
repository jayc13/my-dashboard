import {useState} from 'react';
import useSWR from 'swr';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    Typography,
    Chip,
    Switch,
    FormControlLabel,
    InputAdornment,
} from '@mui/material';
import {Add, Edit, Delete, Link as LinkIcon, Visibility, VisibilityOff, Search} from '@mui/icons-material';
import {DataGrid, type GridColDef, GridActionsCellItem} from '@mui/x-data-grid';
import {API_BASE_URL} from '../utils/constants';
import {apiFetch} from '../utils/helpers';
import type {Application} from '../types';
import {enqueueSnackbar} from 'notistack';

const AppsPage = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [showOnlyWatching, setShowOnlyWatching] = useState(true); // Default to showing only watching apps
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState<Partial<Application>>({
        name: '',
        code: '',
        pipeline_url: '',
        e2e_trigger_configuration: '',
        watching: false,
    });

    const {
        data: apps,
        isLoading: isLoadingApps,
        error,
        mutate,
    } = useSWR<Application[]>(`${API_BASE_URL}/api/apps`);

    const handleOpenDialog = (app?: Application) => {
        if (app) {
            setEditingApp(app);
            setFormData(app);
        } else {
            setEditingApp(null);
            setFormData({
                name: '',
                code: '',
                pipeline_url: '',
                e2e_trigger_configuration: '',
                watching: false,
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingApp(null);
        setFormData({
            name: '',
            code: '',
            pipeline_url: '',
            e2e_trigger_configuration: '',
            watching: false,
        });
    };

    const handleSubmit = async () => {
        try {
            if (!formData.name || !formData.code) {
                enqueueSnackbar('Name and code are required', {variant: 'error'});
                return;
            }

            // Validate JSON if e2e_trigger_configuration is provided
            if (formData.e2e_trigger_configuration && formData.e2e_trigger_configuration.trim()) {
                try {
                    JSON.parse(formData.e2e_trigger_configuration);
                } catch (jsonErr: unknown) {
                    console.error(jsonErr);
                    enqueueSnackbar('E2E Trigger Configuration must be valid JSON', {variant: 'error'});
                    return;
                }
            }

            const url = editingApp
                ? `${API_BASE_URL}/api/apps/${editingApp.id}`
                : `${API_BASE_URL}/api/apps`;

            const method = editingApp ? 'PUT' : 'POST';

            const response = await apiFetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save app');
            }

            enqueueSnackbar(
                editingApp ? 'App updated successfully' : 'App created successfully',
                {variant: 'success'}
            );

            mutate();
            handleCloseDialog();
        } catch (err: unknown) {
            console.log(err);
            enqueueSnackbar('Failed to save app', {variant: 'error'});
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this app?')) {
            return;
        }

        try {
            const response = await apiFetch(`${API_BASE_URL}/api/apps/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete app');
            }

            enqueueSnackbar('App deleted successfully', {variant: 'success'});
            mutate();
        } catch (err: unknown) {
            console.log(err);
            enqueueSnackbar('Failed to delete app', {variant: 'error'});
        }
    };

    const columns: GridColDef[] = [
        {field: 'id', headerName: 'ID', width: 70, minWidth: 70},
        {field: 'name', headerName: 'Name', flex: 1, minWidth: 150},
        {field: 'code', headerName: 'Code', flex: 0.8, minWidth: 120},
        {
            field: 'pipeline_url',
            headerName: 'Pipeline URL',
            flex: 1.2,
            minWidth: 180,
            renderCell: (params) => (
                params.value ? (
                    <Box display="flex" alignItems="center">
                        <LinkIcon fontSize="small" sx={{mr: 1}}/>
                        <a
                            href={params.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{textDecoration: 'none', color: 'inherit'}}
                        >
                            View in Pipelines
                        </a>
                    </Box>
                ) : 'No URL'
            ),
        },
        {
            field: 'e2e_trigger_configuration',
            headerName: 'E2E Config',
            flex: 0.6,
            minWidth: 120,
            renderCell: (params) => (
                params.value ? (
                    <Chip label="Configured" color="primary" size="small"/>
                ) : (
                    <Chip label="Not Set" color="default" size="small"/>
                )
            ),
        },
        {
            field: 'watching',
            headerName: 'Watching',
            width: 100,
            minWidth: 100,
            renderCell: (params) => (
                <Box display="flex" alignItems="center" sx={{height: '100%'}}>
                    {
                        params.value ? (
                            <Visibility color="primary"/>
                        ) : (
                            <VisibilityOff color="disabled"/>
                        )
                    }
                </Box>
            )
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 120,
            minWidth: 120,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<Edit/>}
                    label="Edit"
                    onClick={() => handleOpenDialog(params.row)}
                />,
                <GridActionsCellItem
                    icon={<Delete/>}
                    label="Delete"
                    onClick={() => handleDelete(params.row.id)}
                />,
            ],
        },
    ];

    if (error) {
        return (
            <Card style={{padding: 24, marginTop: 16}}>
                <Alert severity="error">Error fetching apps</Alert>
            </Card>
        );
    }

    // Filter apps based on watching status and search query
    const filteredApps = (apps || [])
        .filter(app => showOnlyWatching ? app.watching : true)
        .filter(app =>
            searchQuery === '' ||
            app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.code.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <Box sx={{p: 3}}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Apps Management
                </Typography>
                <Box display="flex" gap={2} alignItems="center">
                    <Button
                        variant="contained"
                        startIcon={<Add/>}
                        onClick={() => handleOpenDialog()}
                    >
                        Add App
                    </Button>
                </Box>
            </Box>
            <Box display="flex" gap={2} alignItems="center" justifyContent="end" mb={3}>
                <TextField
                    placeholder="Search apps by name or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search/>
                            </InputAdornment>
                        ),
                    }}
                    sx={{width: 300}}
                    size="small"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={showOnlyWatching}
                            onChange={(e) => setShowOnlyWatching(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Show only watching"
                />
            </Box>

            <Card>
                <CardContent>
                    <DataGrid
                        loading={isLoadingApps}
                        rows={filteredApps}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: {page: 0, pageSize: 10},
                            },
                        }}
                        pageSizeOptions={[5, 10, 25]}
                        disableRowSelectionOnClick
                    />
                </CardContent>
            </Card>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingApp ? 'Edit App' : 'Add New App'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{mt: 1}}>
                        <Grid size={{xs: 12, sm: 6}}>
                            <TextField
                                fullWidth
                                label="Name"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <TextField
                                fullWidth
                                label="Code"
                                value={formData.code || ''}
                                onChange={(e) => setFormData({...formData, code: e.target.value})}
                                required
                                helperText="Unique identifier for the app"
                            />
                        </Grid>
                        <Grid size={{xs: 12}}>
                            <TextField
                                fullWidth
                                label="Pipeline URL"
                                value={formData.pipeline_url || ''}
                                onChange={(e) => setFormData({...formData, pipeline_url: e.target.value})}
                                helperText="Optional URL to the CI/CD pipeline"
                            />
                        </Grid>
                        <Grid size={{xs: 12}}>
                            <TextField
                                fullWidth
                                label="E2E Trigger Configuration"
                                value={formData.e2e_trigger_configuration || ''}
                                onChange={(e) => setFormData({...formData, e2e_trigger_configuration: e.target.value})}
                                multiline
                                rows={10}
                                helperText="Optional JSON configuration for E2E test triggers"
                                placeholder='{"environment": "staging", "browser": "chrome"}'
                            />
                        </Grid>
                        <Grid size={{xs: 12}}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.watching || false}
                                        onChange={(e) => setFormData({...formData, watching: e.target.checked})}
                                        color="primary"
                                    />
                                }
                                label="Watching"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingApp ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AppsPage;
