import { Box, Typography } from "@mui/material";

export default function PageHeader({ title, subtitle, mb = 3 }) {
  return (
    <Box sx={{ mb }}>
      <Typography variant="h2" component="h1">
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  );
}



