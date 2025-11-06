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
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft,
  Dashboard,
  FolderOpen,
  Assessment,
  People,
  Settings,
  ExitToApp,
  AccountCircle,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@hooks/redux';
import { logout } from '@store/slices/authSlice';

const drawerWidth = 280;

interface MenuItemType {
  title: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const menuItems: MenuItemType[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <Dashboard />,
  },
  {
    title: 'Expedientes',
    path: '/expedientes',
    icon: <FolderOpen />,
  },
  {
    title: 'Reportes',
    path: '/reportes',
    icon: <Assessment />,
  },
  {
    title: 'Usuarios',
    path: '/admin/usuarios',
    icon: <People />,
    roles: ['administrador', 'coordinador_archivo'],
  },
  {
    title: 'Configuración',
    path: '/configuracion',
    icon: <Settings />,
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
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

  const renderMenuItem = (item: MenuItemType) => {
    // Verificar permisos
    if (item.roles && !item.roles.includes(user?.rol || '')) {
      return null;
    }

    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

    return (
      <ListItem key={item.title} disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? 'initial' : 'center',
            px: 2.5,
            bgcolor: isActive ? 'primary.main' : 'transparent',
            color: isActive ? 'white' : 'text.primary',
            '&:hover': {
              bgcolor: isActive ? 'primary.dark' : 'action.hover',
            },
          }}
          onClick={() => {
            navigate(item.path);
            if (isMobile) setOpen(false);
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : 'auto',
              justifyContent: 'center',
              color: isActive ? 'white' : 'inherit',
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
        </ListItemButton>
      </ListItem>
    );
  };

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

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => location.pathname.startsWith(item.path))?.title || 'CCAMEM'}
          </Typography>

          <Chip
            avatar={<Avatar>{user?.nombre?.charAt(0)}</Avatar>}
            label={user?.nombre}
            onClick={handleProfileMenuOpen}
            sx={{ mr: 2 }}
          />

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
            <Typography variant="h6" noWrap component="div">
              CCAMEM
            </Typography>
          )}
          <IconButton onClick={handleDrawerToggle} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <ChevronLeft />
          </IconButton>
        </Toolbar>

        <Divider />

        <List>
          {menuItems.map(item => renderMenuItem(item))}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Divider />

        {open && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" display="block">
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
