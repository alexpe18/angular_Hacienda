const express = require('express');
const router = express.Router();

// Aquí almacenaremos las reservaciones temporalmente
let reservaciones = [
    { fecha: '2024-09-20', hora: '10:00' }, // Reservación de ejemplo
];

// Ruta para obtener todas las reservaciones
router.get('/', (req, res) => {
    res.json(reservaciones);
});

// Ruta para agregar una nueva reservación
router.post('/', (req, res) => {
    const nuevaReservacion = req.body;
    const existe = reservaciones.some(res => res.fecha === nuevaReservacion.fecha);

    // Si la fecha ya está reservada
    if (existe) {
        return res.status(400).json({ mensaje: 'Fecha ya reservada' });
    }

    // Si no está reservada, la agregamos
    reservaciones.push(nuevaReservacion);
    res.status(201).json({ mensaje: 'Reservación creada con éxito' });
});

module.exports = router;
