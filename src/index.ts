process.env.TZ = "Asia/Jakarta"

import express from 'express';
import masterRoutes from './routes/master-routes';
import {loginUser} from './services/auth/authentication';

const app = express();
const PORT = process.env.APPPORT || 3000;

app.use(express.json());

// Routes
const group = 'api/v1';

app.use(`/${group}/master`, masterRoutes);
app.post(`/${group}/auth/login`, loginUser);  // Login route

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
