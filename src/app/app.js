const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(cors()); // Permite acceso desde el frontend
app.use(bodyParser.json()); // Para poder recibir JSON

// Importa las rutas de reservaciones
const reservaciones = require('./routes/reservaciones');
app.use('/api/reservaciones', reservaciones);

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
