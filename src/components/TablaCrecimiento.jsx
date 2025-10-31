import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { mes: "Ene", afiliados: 1700 },
  { mes: "Feb", afiliados: 2100 },
  { mes: "Mar", afiliados: 2500 },
  { mes: "Abr", afiliados: 2800 },
  { mes: "May", afiliados: 3000 },
  { mes: "Jun", afiliados: 3200 },
];

export default function GrowthChart() {
  return (
    <Card sx={{ flex: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold">Crecimiento de Afiliados</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Últimos 6 meses
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="afiliados" fill="#000000" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}