import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { Edit, Delete, Link as LinkIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { DataGrid, type GridColDef, GridActionsCellItem, type GridRowClassNameParams } from '@mui/x-data-grid';
import type { Application } from '@/types';

export interface AppsDataGridProps {
    apps: Application[];
    loading: boolean;
    totalApps: number;
    onEdit: (app: Application) => void;
    onDelete: (id: number) => void;
}

const AppsDataGrid = (props: AppsDataGridProps) => {
    const { apps, loading, totalApps, onEdit, onDelete } = props;

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70, minWidth: 70 },
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
        { field: 'code', headerName: 'Code', flex: 0.8, minWidth: 120 },
        {
            field: 'pipelineUrl',
            headerName: 'Pipeline URL',
            flex: 1.2,
            minWidth: 180,
            renderCell: (params) =>
                params.value ? (
                    <Box display="flex" alignItems="center">
                        <LinkIcon fontSize="small" sx={{ mr: 1 }} />
                        <a
                            href={params.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            View in Pipelines
                        </a>
                    </Box>
                ) : (
                    'No URL'
                ),
        },
        {
            field: 'e2eTriggerConfiguration',
            headerName: 'E2E Config',
            flex: 0.6,
            minWidth: 120,
            renderCell: (params) =>
                params.value ? (
                    <Chip label="Configured" color="primary" size="small" />
                ) : (
                    <Chip label="Not Set" color="default" size="small" />
                ),
        },
        {
            field: 'watching',
            headerName: 'Watching',
            width: 100,
            minWidth: 100,
            renderCell: (params) => (
                <Box display="flex" alignItems="center" sx={{ height: '100%' }}>
                    {params.value ? (
                        <Visibility color="primary" data-testid="watching-flag" />
                    ) : (
                        <VisibilityOff color="disabled" data-testid="no-watching-flag" />
                    )}
                </Box>
            ),
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 120,
            minWidth: 120,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<Edit />}
                    label="Edit"
                    onClick={() => onEdit(params.row)}
                    data-testid={`app-edit-button-${params.row.code}`}
                />,
                <GridActionsCellItem
                    icon={<Delete />}
                    label="Delete"
                    onClick={() => onDelete(params.row.id)}
                    data-testid={`app-delete-button-${params.row.id}`}
                />,
            ],
        },
    ];

    return (
        <Card>
            <CardContent data-testid="apps-data-grid">
                <DataGrid
                    loading={loading}
                    rows={apps}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                    sx={{ minHeight: 400 }}
                    getRowClassName={(params: GridRowClassNameParams<Application>) =>
                        `app-row-${params.row.code}`
                    }
                    slots={{
                        noRowsOverlay: () => (
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                height="100%"
                                p={3}
                            >
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    {totalApps === 0 ? 'No apps found' : 'No apps match your filters'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {totalApps === 0
                                        ? 'Create your first app to get started'
                                        : 'Try adjusting your search query or filters'}
                                </Typography>
                            </Box>
                        ),
                    }}
                />
            </CardContent>
        </Card>
    );
};

export default AppsDataGrid;

