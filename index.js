require('dotenv').config();
const axios = require('axios');

console.log('🔔 Verificando recordatorios a través de la API...');

(async () => {
  try {
    // Llama a la ruta de tu API para revisar recordatorios
    const response = await axios.get('https://barberagend.onrender.com/api/check-reminders');
    console.log('✅ Respuesta de la API:', response.data);
  } catch (error) {
    console.error('❌ Error al llamar a la API:', error.message);
  }
})();

console.log('⏳ Script de recordatorios ejecutado...');
