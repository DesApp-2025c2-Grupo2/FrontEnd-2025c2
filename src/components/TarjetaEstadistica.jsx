import React from "react";
import { Card, CardContent, Box, Typography, Divider } from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

const TarjetaEstadistica = ({ title, icon, value, changeValue, positive }) => {
  return (
    <Card sx={{ flex: 1, p: 2 }}>
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          gap={0.5}
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center">
            {icon}
          </Box>
          {/*          <Box display="flex" >
            {positive ? (
              <TrendingUpIcon fontSize="small" color="success" />
            ) : (
              <TrendingDownIcon fontSize="small" color="error" />
            )}
            <Typography
              variant="body2"
              color={positive ? "success" : "error"}
            >
              {changeValue}
            </Typography>
          </Box>*/}
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold" color="#1F2121">
          {value}
        </Typography>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography variant="body2" color="text.secondary">
            vs. mes anterior
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TarjetaEstadistica;
