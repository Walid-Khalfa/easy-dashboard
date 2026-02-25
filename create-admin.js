const http = require('http');

// Configuration - MODIFIEZ CES VALEURS
const adminData = {
  email: 'admin@easy-dashboard.com',
  password: 'Admin123!@#',
  passwordCheck: 'Admin123!@#',
  name: 'Admin',
  surname: 'User'
};

const data = JSON.stringify(adminData);

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

console.log('📝 Création du compte admin...\n');
console.log('Email:', adminData.email);
console.log('Mot de passe:', adminData.password);
console.log('Nom:', adminData.name, adminData.surname);
console.log('\n---\n');

const req = http.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(body);
      
      if (result.success) {
        console.log('✅ Compte admin créé avec succès !\n');
        console.log('Réponse:', JSON.stringify(result, null, 2));
        console.log('\n---\n');
        console.log('📌 Connectez-vous avec :');
        console.log('   Email:', adminData.email);
        console.log('   Mot de passe:', adminData.password);
      } else {
        console.log('❌ Échec de la création du compte\n');
        console.log('Message:', result.message);
        console.log('Réponse:', body);
      }
    } catch (e) {
      console.log('❌ Erreur lors du parsing de la réponse\n');
      console.log('Réponse brute:', body);
    }
  });
});

req.on('error', (e) => {
  console.log('❌ Erreur de connexion au serveur\n');
  console.log('Erreur:', e.message);
  console.log('\nAssurez-vous que le serveur backend tourne sur http://localhost:8000');
});

req.write(data);
req.end();
