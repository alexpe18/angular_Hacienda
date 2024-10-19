const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment'); // Importar moment.js

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conectar a MongoDB Atlas con tu URL personalizada
const uri = "mongodb+srv://aperez9:qXmNuhstfsvbejmE@cluster0.1xvvo.mongodb.net/hacienda?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Atlas conectado'))
  .catch(err => console.log('Error al conectar a MongoDB Atlas:', err));

// Definir un modelo para las reservas
const reservaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  correo: { type: String, required: true },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true },
  servicio: { type: [String], required: true }, // Array de servicios seleccionados
  comentarios: { type: String } // Comentarios opcionales
});

const Reserva = mongoose.model('Reserva', reservaSchema);

// Configuración del transporte para nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hciendadonaadriana@gmail.com', // Tu dirección de correo
    pass: 'sypuybfpopjfnaiy', // Tu contraseña o contraseña de aplicación
  },
});

// Función para enviar correos
function enviarCorreo(nombre, telefono, correo, fecha, hora, servicio) {
  const formattedFecha = moment(fecha).format('YYYY/MM/DD');
  const mailOptions = {
    from: 'hciendadonaadriana@gmail.com',
    to: correo, // Usar el correo dinámico del cliente
    subject: 'Confirmación de Reserva',
    text: `Hola ${nombre},\n\nTu reserva ha sido confirmada.\nNombre: ${nombre}\nTeléfono: ${telefono}
    \nCorreo: ${correo}\nFecha: ${formattedFecha}\nHora: ${hora}\nServicios seleccionados: ${servicio.join(', ')}\n\n¡Gracias por tu preferencia!`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error al enviar el correo:', error);
    } else {
      console.log('Correo enviado:', info.response);
    }
  });
}

// Ruta para obtener las fechas reservadas
app.get('/api/fechas-ocupadas', async (req, res) => {
  try {
    const reservas = await Reserva.find({}, 'fecha');
    const fechasOcupadas = reservas.map(reserva => moment(reserva.fecha).format('YYYY-MM-DD'));
    res.json(fechasOcupadas);
  } catch (error) {
    console.log('Error al obtener fechas ocupadas:', error);
    res.status(500).json({ error: 'Error al obtener fechas ocupadas' });
  }
});

// Ruta para manejar la reserva
app.post('/api/reservaciones', async (req, res) => {
  const { nombre, telefono, correo, fecha, hora, servicio, comentarios } = req.body;

  try {
    // Verificar si la fecha ya está reservada
    const fechaReservada = await Reserva.findOne({
      fecha: {
        $gte: moment(fecha).startOf('day').toDate(),
        $lt: moment(fecha).endOf('day').toDate()
      }
    });

    if (fechaReservada) {
      return res.status(400).json({ error: 'La fecha seleccionada ya está reservada. Por favor, elige otra fecha.' });
    }

    // Crear una nueva reserva
    const nuevaReserva = new Reserva({
      nombre,
      telefono,
      correo,
      fecha: new Date(fecha),
      hora,
      servicio,
      comentarios
    });

    // Guardar la reserva en la base de datos
    const reservaGuardada = await nuevaReserva.save();

    // Enviar el correo de confirmación
    enviarCorreo(nombre, telefono, correo, reservaGuardada.fecha, hora, servicio);

    // Responder al cliente con la reserva
    res.status(201).json(reservaGuardada);
  } catch (err) {
    console.log('Error al guardar la reserva:', err);
    res.status(500).json({ error: 'Error al guardar la reserva' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
