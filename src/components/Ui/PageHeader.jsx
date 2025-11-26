import { Box, Typography } from "@mui/material";

export default function PageHeader({ title, subtitle, mb = 3 }) {
  return (
    <Box sx={{ mb: { xs: 2, sm: mb } }}>
      <Typography
        variant="h2"
        component="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          lineHeight: 1.2
        }}
      >
        {title}
      </Typography>
      {subtitle ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  );
}



