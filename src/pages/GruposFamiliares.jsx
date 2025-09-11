import React, { useState } from 'react'
import {Box, InputAdornment, TextField, Typography} from "@mui/material"
import TarjetaFamiliar from '../components/TarjetaFamiliar'
import DialogGrupoFamiliar from '../components/DialogGrupoFamiliar'
import SearchIcon from "@mui/icons-material/Search";
import DialogCambioPlan from '../components/DialogCambioPlan';
// DATOS HARDCODEADOS PARA PRUEBA
const familias = [
  {
    id: "0000000001",
    nombre: "Lopez", 
    planMedico: 1,
    alta: "1/10/2020"
  },
  {
    id:  "0000000002",
    nombre: "Rodriguez", 
    planMedico: 2,
    alta: "20/08/2021"
  },
  {
    id:  "0000000003",
    nombre: "Suarez", 
    planMedico: 3,
    alta: "12/04/2020"
  }
]

const planes = [
  {
    id: 1,
    nombre: "Plan 360"
  },
  {
    id: 2,
    nombre: "Plan 240"
  },
  {
    id: 3,
    nombre: "Plan Platino"
  },
  {
    id: 4,
    nombre: "Plan Básico"
  },
]

const afiliados = [
  {nombre: "Juan", apellido: "Lopez", dni: "13456789", grupoFamiliar: "0000000001", nroIntegrante: "01", parentesco: 1},
  {nombre: "Julia", apellido: "Suarez", dni: "33908000", grupoFamiliar: "0000000003", nroIntegrante: "01", parentesco: 1},
  {nombre: "María", apellido: "Rodriguez", dni: "40563111", grupoFamiliar: "0000000002", nroIntegrante: "01", parentesco: 1},
  {nombre: "Lucía", apellido: "Lopez", dni: "41123123", grupoFamiliar: "0000000001", nroIntegrante: "02", parentesco: 3},
  {nombre: "Martin", apellido: "Suarez", dni: "45555444", grupoFamiliar: "0000000003", nroIntegrante: "02",parentesco: 3},
  {nombre: "Pablo", apellido: "Lopez", dni: "47000222", grupoFamiliar: "0000000001", nroIntegrante: "03", parentesco: 3}
]
const titulares = [
    {nombre: "Juan", dni: "13456789", grupoFamiliar: "0000000001", parentesco: 1},
    {nombre: "Julia", dni: "33908000", grupoFamiliar: "0000000003", paretesco: 1},
    {nombre: "María", dni: "40563111", grupoFamiliar: "0000000002", parentesco: 1}
]

//funciones para pruebas
const encontrarTitulares = function (afiliados){
    return afiliados.filter(afiliado => afiliado.parentesco === 1)
}
const afiliadosPorGrupoFamiliar = function(listaAfiliados, grupoFamiliar){
  return listaAfiliados.filter(afiliado => afiliado.grupoFamiliar === grupoFamiliar.id)
}

const titularDeGrupoFamiliar = function(titulares, grupoFamiliar){
    const titularHayado = titulares.find(afiliado => afiliado.grupoFamiliar === grupoFamiliar.id)
    console.log("Este es el titular hayado:")
    console.log(titularHayado)
    return titularHayado
}

// FIN DE FUNCIONES Y DATOS HARDCODEADOS
  
function GruposFamiliares() {
  const [busqueda, setBusqueda] = useState("")

  const [openDetalles, setOpenDetalles] = useState(false);
  const [openCambiarPlan, setOpenCambiarPlan] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null)
  const [integrantesDelGrupo, setIntegrantesDelGrupo] = useState(null)

  const handleVerDetalles = (grupo) => {
  setGrupoSeleccionado(grupo);
  setOpenDetalles(true);
  setIntegrantesDelGrupo(afiliadosPorGrupoFamiliar(afiliados, grupo))
};

const handleCambiarPlan = (grupo) => {
  setGrupoSeleccionado(grupo);
  setOpenCambiarPlan(true);
};


  // Filtrar familias según la búsqueda
  const familiasFiltradas = familias.filter(familia =>
    familia.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    familia.id.includes(busqueda) // también busca por ID
  );
  return (
    <>
    <Typography variant="h4" color="secondary">Grupos Familiares</Typography>
    <Typography variant="p">Gestión de grupos familiares existentes</Typography>
    <TextField
        placeholder="Buscar familia por nombre o n° de afiliado"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ mb: 3 }}
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
    <Box>
      {familiasFiltradas.map(familia => {
        var titularFamilia = titularDeGrupoFamiliar(titulares, familia)
        var cantAfiliados = afiliadosPorGrupoFamiliar(afiliados, familia).length
        return <TarjetaFamiliar 
        familia={familia}
        key={familia.id}
        titularFamilia={titularFamilia}
        cantAfiliados={cantAfiliados}
        onVerDetalles={handleVerDetalles}
        onCambiarPlan={handleCambiarPlan}
        planes={planes}/>
      })}
    </Box>
    <DialogGrupoFamiliar
        grupo={grupoSeleccionado}
        open={openDetalles}
        onClose={() => {
        setOpenDetalles(false);
        setGrupoSeleccionado(null);
        setIntegrantesDelGrupo(null)
        }}
        planes={planes}
        integrantes={integrantesDelGrupo}
      />
    <DialogCambioPlan
      grupo={grupoSeleccionado}
      open={openCambiarPlan}
      onClose={() => {
      setOpenCambiarPlan(false);
      setGrupoSeleccionado(null);
      }}
      planes={planes}
    />
    </>
  )
}

export default GruposFamiliares