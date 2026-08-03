import {
  Avatar,
  Box,
  Typography,
} from "@mui/material";

interface TimelineAvatarProps {
  name: string;

  role?: string;
}

function getInitials(
  name: string
): string {
  const words =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    words.length === 0
  ) {
    return "?";
  }

  if (
    words.length === 1
  ) {
    return words[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[
      words.length - 1
    ][0]
  ).toUpperCase();
}

function TimelineAvatar({
  name,
  role,
}: TimelineAvatarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Avatar
        sx={{
          width: 42,
          height: 42,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontWeight: 700,
          fontSize: 15,
          boxShadow: 2,
          flexShrink: 0,
        }}
      >
        {getInitials(name)}
      </Avatar>

      <Box
        sx={{
          minWidth: 0,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={700}
          noWrap
        >
          {name}
        </Typography>

        {role && (
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
          >
            {role}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default TimelineAvatar;