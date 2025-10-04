# Frontend Development - Sistema de Gestión Archivística CCAMEM

## 🎨 Configuración Inicial del Frontend

### 1. CREAR PROYECTO REACT CON TYPESCRIPT

```bash
npx create-react-app frontend --template typescript
cd frontend
```

### 2. INSTALAR TODAS LAS DEPENDENCIAS

```bash
# UI Framework - Material-UI
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/x-data-grid @mui/lab
npm install @mui/x-date-pickers dayjs

# Routing
npm install react-router-dom @types/react-router-dom

# State Management
npm install @reduxjs/toolkit react-redux

# Forms & Validation
npm install react-hook-form yup @hookform/resolvers

# HTTP Client
npm install axios

# Utilities
npm install lodash @types/lodash
npm install uuid @types/uuid
npm install clsx

# Reports & Export
npm install exceljs file-saver jspdf jspdf-autotable
npm install @types/file-saver

# Charts
npm install recharts

# Notifications
npm install notistack

# Development
npm install -D @types/node env-cmd
```

## 📝 Prompts Detallados para Claude Code

### PROMPT 1: CONFIGURAR ESTRUCTURA BASE Y TYPESCRIPT

```
Configura la estructura base del frontend React con TypeScript:

frontend/tsconfig.json:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@pages/*": ["pages/*"],
      "@services/*": ["services/*"],
      "@hooks/*": ["hooks/*"],
      "@utils/*": ["utils/*"],
      "@types/*": ["types/*"],
      "@store/*": ["store/*"],
      "@assets/*": ["assets/*"],
      "@theme/*": ["theme/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

frontend/.env:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_TITLE=Sistema de Gestión Archivística CCAMEM
REACT_APP_VERSION=1.0.0
REACT_APP_TIMEOUT=30000
```

frontend/src/index.tsx:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SnackbarProvider } from 'notistack';
import 'dayjs/locale/es-mx';

import { store } from './store/store';
import { theme } from './theme';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es-mx">
            <SnackbarProvider 
              maxSnack={3}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <CssBaseline />
              <App />
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
```

frontend/src/App.tsx:
```typescript
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { checkAuth } from './store/slices/authSlice';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExpedientesList from './pages/Expedientes/ExpedientesList';
import ExpedienteForm from './pages/Expedientes/ExpedienteForm';
import ExpedienteDetail from './pages/Expedientes/ExpedienteDetail';
import Reports from './pages/Reports';
import Users from './pages/Admin/Users';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

// Components
import PrivateRoute from './components/common/PrivateRoute';
import Loading from './components/common/Loading';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : (
          <AuthLayout>
            <Login />
          </AuthLayout>
        )
      } />

      {/* Rutas privadas */}
      <Route path="/" element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Expedientes */}
        <Route path="expedientes">
          <Route index element={<ExpedientesList />} />
          <Route path="nuevo" element={<ExpedienteForm />} />
          <Route path=":id/editar" element={<ExpedienteForm />} />
          <Route path=":id" element={<ExpedienteDetail />} />
        </Route>
        
        {/* Reportes */}
        <Route path="reportes" element={<Reports />} />
        
        {/* Administración */}
        <Route path="admin">
          <Route path="usuarios" element={<Users />} />
        </Route>
        
        {/* Usuario */}
        <Route path="perfil" element={<Profile />} />
        <Route path="configuracion" element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
```

### PROMPT 2: CREAR TEMA PERSONALIZADO Y LAYOUTS

```
Crea el tema personalizado de Material-UI y los layouts principales:

frontend/src/theme/index.ts:
```typescript
import { createTheme, alpha } from '@mui/material/styles';

// Colores institucionales CCAMEM
const colors = {
  primary: {
    main: '#8B1538', // Guinda institucional
    light: '#A94064',
    dark: '#5C0E25',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#757575',
    light: '#A4A4A4',
    dark: '#494949',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#4CAF50',
    light: '#80E27E',
    dark: '#087F23',
  },
  warning: {
    main: '#FF9800',
    light: '#FFB547',
    dark: '#C66900',
  },
  error: {
    main: '#F44336',
    light: '#E57373',
    dark: '#C62828',
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1565C0',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    grey: colors.grey,
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.54)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.75,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
    '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
    '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
    '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
    '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
    '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    // ... más shadows
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
        },
      },
    },
  },
});
```

frontend/src/layouts/MainLayout.tsx:
```typescript
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Collapse,
  Breadcrumbs,
  Link,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  Dashboard,
  FolderOpen,
  Assessment,
  People,
  Settings,
  ExitToApp,
  ExpandLess,
  ExpandMore,
  Add,
  Search,
  SwapHoriz,
  MoveUp,
  AccountCircle,
  Notifications,
  NavigateNext,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { logout } from '@/store/slices/authSlice';
import logoGobierno from '@/assets/logo-gobierno.png';
import logoCCAMEM from '@/assets/logo-ccamem.png';

const drawerWidth = 280;

interface MenuItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  children?: MenuItem[];
  roles?: string[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <Dashboard />,
  },
  {
    title: 'Expedientes',
    icon: <FolderOpen />,
    children: [
      { title: 'Consultar', path: '/expedientes', icon: <Search /> },
      { title: 'Nuevo Expediente', path: '/expedientes/nuevo', icon: <Add /> },
      { title: 'Préstamos', path: '/expedientes/prestamos', icon: <SwapHoriz /> },
      { title: 'Transferencias', path: '/expedientes/transferencias', icon: <MoveUp /> },
    ],
  },
  {
    title: 'Reportes',
    path: '/reportes',
    icon: <Assessment />,
  },
  {
    title: 'Administración',
    icon: <Settings />,
    roles: ['administrador', 'coordinador_archivo'],
    children: [
      { title: 'Usuarios', path: '/admin/usuarios', icon: <People /> },
      { title: 'Unidades', path: '/admin/unidades', icon: <FolderOpen /> },
      { title: 'Catálogos', path: '/admin/catalogos', icon: <Settings /> },
    ],
  },
];

export default function MainLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(!isMobile);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.children) {
      const index = expandedItems.indexOf(item.title);
      if (index >= 0) {
        setExpandedItems(expandedItems.filter(i => i !== item.title));
      } else {
        setExpandedItems([...expandedItems, item.title]);
      }
    } else if (item.path) {
      navigate(item.path);
      if (isMobile) {
        setOpen(false);
      }
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    // Verificar permisos
    if (item.roles && !item.roles.includes(user?.rol?.nombre || '')) {
      return null;
    }

    const isExpanded = expandedItems.includes(item.title);
    const isActive = item.path === location.pathname;

    return (
      <React.Fragment key={item.title}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              pl: depth > 0 ? 4 : 2.5,
              bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              color: isActive ? 'primary.main' : 'text.primary',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
            onClick={() => handleMenuClick(item)}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
                color: isActive ? 'primary.main' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.title} 
              sx={{ opacity: open ? 1 : 0 }}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: isActive ? 500 : 400,
              }}
            />
            {item.children && open && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        {item.children && (
          <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map(child => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  // Generar breadcrumbs
  const pathnames = location.pathname.split('/').filter(x => x);
  const breadcrumbs = pathnames.map((value, index) => {
    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
    const isLast = index === pathnames.length - 1;
    
    return isLast ? (
      <Typography key={to} color="text.primary" fontSize="0.875rem">
        {value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ')}
      </Typography>
    ) : (
      <Link
        key={to}
        underline="hover"
        color="inherit"
        href={to}
        onClick={(e) => {
          e.preventDefault();
          navigate(to);
        }}
        fontSize="0.875rem"
      >
        {value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ')}
      </Link>
    );
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${open ? drawerWidth : 60}px)` },
          ml: { md: `${open ? drawerWidth : 60}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Breadcrumbs */}
          <Box sx={{ flexGrow: 1 }}>
            <Breadcrumbs
              separator={<NavigateNext fontSize="small" />}
              aria-label="breadcrumb"
            >
              <Link
                underline="hover"
                color="inherit"
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                }}
                fontSize="0.875rem"
              >
                Inicio
              </Link>
              {breadcrumbs}
            </Breadcrumbs>
          </Box>

          {/* User info */}
          <Chip
            avatar={<Avatar>{user?.nombre?.charAt(0)}</Avatar>}
            label={user?.nombre}
            onClick={handleProfileMenuOpen}
            sx={{ mr: 2 }}
          />

          {/* Notifications */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Notifications />
          </IconButton>

          {/* Profile menu */}
          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
          >
            <AccountCircle />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={() => { navigate('/perfil'); handleProfileMenuClose(); }}>
              Mi Perfil
            </MenuItem>
            <MenuItem onClick={() => { navigate('/configuracion'); handleProfileMenuClose(); }}>
              Configuración
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? open : true}
        onClose={handleDrawerToggle}
        sx={{
          width: open ? drawerWidth : 60,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 60,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: [1],
        }}>
          {open && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src={logoCCAMEM} 
                alt="CCAMEM" 
                style={{ height: 40, marginRight: 8 }}
              />
              <Typography variant="h6" noWrap component="div">
                CCAMEM
              </Typography>
            </Box>
          )}
          <IconButton onClick={handleDrawerToggle} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Toolbar>
        
        <Divider />
        
        <List>
          {menuItems.map(item => renderMenuItem(item))}
        </List>

        <Box sx={{ flexGrow: 1 }} />
        
        <Divider />
        
        {/* Footer del drawer */}
        {open && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <img 
              src={logoGobierno} 
              alt="Gobierno del Estado de México" 
              style={{ width: '100%', maxWidth: 200 }}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Sistema de Gestión Archivística
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              v{process.env.REACT_APP_VERSION || '1.0.0'}
            </Typography>
          </Box>
        )}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${open ? drawerWidth : 60}px)` },
          ml: { md: open ? 0 : 0 },
          mt: 8,
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
```

### PROMPT 3: CREAR PÁGINA DE LOGIN

```
Crea la página de login completa:

frontend/src/pages/Login/Login.tsx:
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
  Link,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AccountCircle,
  Lock,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { login } from '@/store/slices/authSlice';
import logoGobierno from '@/assets/logo-gobierno.png';
import logoCCAMEM from '@/assets/logo-ccamem.png';

const schema = yup.object({
  username: yup.string().required('El usuario es requerido'),
  password: yup.string().required('La contraseña es requerida'),
  remember: yup.boolean(),
});

type FormData = yup.InferType<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: