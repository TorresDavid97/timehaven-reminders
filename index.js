const admin = require('firebase-admin');
const cron = require('node-cron');
require('dotenv').config();

// Inicializar Firebase
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://appoimentsapp.firebaseio.com',
  });
}

const db = admin.firestore();
const { Timestamp } = require('firebase-admin/firestore');

// Tarea programada cada minuto
cron.schedule('* * * * *', async () => {
  console.log('🔔 Verificando recordatorios para enviar...');

  const now = new Date();
  const nowTimestamp = Timestamp.fromDate(now);

  try {
    // Solo filtramos por fecha
    const snapshot = await db
      .collection('appoiment')
      .where('reminderTimestamp', '<=', nowTimestamp)
      .get();

    if (snapshot.empty) {
      console.log('✅ No hay recordatorios pendientes.');
      return;
    }

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const appointmentId = doc.id;

      // Filtros adicionales en código
      if (data.reminderSent === true || data.appointmentStatus === 'Canceled') continue;

      const clientName = data.clientName || 'Cliente';
      const time = data.startTime.toDate();
      const formattedTime = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      console.log(`📩 Recordatorio enviado a ${clientName} a las ${formattedTime} (ID: ${appointmentId})`);

      // Marcar como enviado
      await db.collection('appoiment').doc(appointmentId).update({
        reminderSent: true,
      });
    }
  } catch (error) {
    console.error('❌ Error al verificar o enviar recordatorios:', error.message);
  }
}, {
  timezone: 'America/New_York'
});

console.log('⏳ Cron job de recordatorios inicializado...');
