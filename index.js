const admin = require('firebase-admin');
require('dotenv').config();

// Inicializar Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.GOOGLE_PROJECT_ID,
      clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
      privateKey: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: 'https://appoimentsapp.firebaseio.com',
  });
}

const db = admin.firestore();
const { Timestamp } = require('firebase-admin/firestore');

// Tarea programada cada minuto (solo si ejecutas manualmente, en Render no es necesario esto)
console.log('🔔 Verificando recordatorios para enviar...');

const now = new Date();
const nowTimestamp = Timestamp.fromDate(now);

(async () => {
  try {
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

      if (data.reminderSent === true || data.appointmentStatus === 'Canceled') continue;

      const clientName = data.clientName || 'Cliente';
      const time = data.startTime.toDate();
      const formattedTime = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      console.log(`📩 Recordatorio enviado a ${clientName} a las ${formattedTime} (ID: ${appointmentId})`);

      await db.collection('appoiment').doc(appointmentId).update({
        reminderSent: true,
      });
    }
  } catch (error) {
    console.error('❌ Error al verificar o enviar recordatorios:', error.message);
  }
})();

console.log('⏳ Script de recordatorios ejecutado...');
