import {
  Avatar,
  Box,
  Stack,
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
    words.length ===
    0
  ) {
    return "?";
  }

  if (
    words.length ===
    1
  ) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${
    words[
      words.length - 1
    ][0]
  }`.toUpperCase();
}

function TimelineAvatar({
  name,
  role,
}: TimelineAvatarProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
    >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          fontSize: "0.75rem",
          fontWeight: 700,
        }}
      >
        {getInitials(
          name
        )}
      </Avatar>

      <Box minWidth={0}>
        <Typography
          variant="caption"
          fontWeight={700}
          display="block"
          noWrap
        >
          {name}
        </Typography>

        {role && (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            noWrap
          >
            {role}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export default TimelineAvatar;