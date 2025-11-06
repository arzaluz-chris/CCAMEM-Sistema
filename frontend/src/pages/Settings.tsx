import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import {
  People,
  Security,
  LockReset,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import UsuariosTab from '../components/Settings/UsuariosTab';
import RolesTab from '../components/Settings/RolesTab';
import PasswordTab from '../components/Settings/PasswordTab';
import SistemaTab from '../components/Settings/SistemaTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Settings() {
  const [currentTab, setCurrentTab] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.rol === 'ADMIN';
  const isCoordinador = user.rol === 'COORDINADOR_ARCHIVO';

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configuración
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Administra usuarios, roles, permisos y configuración del sistema
      </Typography>

      <Paper>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="configuración tabs"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {(isAdmin || isCoordinador) && (
            <Tab icon={<People />} label="Usuarios" iconPosition="start" />
          )}
          {isAdmin && (
            <Tab icon={<Security />} label="Roles y Permisos" iconPosition="start" />
          )}
          <Tab icon={<LockReset />} label="Cambiar Contraseña" iconPosition="start" />
          {isAdmin && (
            <Tab icon={<SettingsIcon />} label="Sistema" iconPosition="start" />
          )}
        </Tabs>

        {(isAdmin || isCoordinador) && (
          <TabPanel value={currentTab} index={0}>
            <UsuariosTab />
          </TabPanel>
        )}

        {isAdmin && (
          <TabPanel value={currentTab} index={1}>
            <RolesTab />
          </TabPanel>
        )}

        <TabPanel
          value={currentTab}
          index={isAdmin ? 2 : (isCoordinador ? 1 : 0)}
        >
          <PasswordTab />
        </TabPanel>

        {isAdmin && (
          <TabPanel value={currentTab} index={3}>
            <SistemaTab />
          </TabPanel>
        )}
      </Paper>
    </Box>
  );
}
