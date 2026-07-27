import {
  Chip,
  type ChipProps,
} from "@mui/material";

import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

import type { UserRole } from "../../types/User";

interface RoleChipProps {
  role: UserRole | string;
  size?: ChipProps["size"];
}

interface RoleConfig {
  color: ChipProps["color"];
  icon: React.ReactElement;
}

const roleConfig: Record<UserRole, RoleConfig> = {
  Administrador: {
    color: "error",
    icon: <AdminPanelSettingsOutlinedIcon />,
  },

  Técnico: {
    color: "primary",
    icon: <EngineeringOutlinedIcon />,
  },

  Solicitante: {
    color: "default",
    icon: <PersonOutlineOutlinedIcon />,
  },
};

function RoleChip({
  role,
  size = "small",
}: RoleChipProps) {
  const config = roleConfig[role as UserRole];

  if (!config) {
    return (
      <Chip
        label={role || "Perfil não definido"}
        color="default"
        icon={<HelpOutlineOutlinedIcon />}
        size={size}
        variant="outlined"
        sx={{
          fontWeight: 600,

          "& .MuiChip-icon": {
            fontSize: 18,
          },
        }}
      />
    );
  }

  return (
    <Chip
      label={role}
      color={config.color}
      icon={config.icon}
      size={size}
      variant="outlined"
      sx={{
        fontWeight: 600,

        "& .MuiChip-icon": {
          fontSize: 18,
        },
      }}
    />
  );
}

export default RoleChip;