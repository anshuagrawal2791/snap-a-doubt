require('dotenv').load();
const env = process.env.NODE_ENV; // 'dev' or 'test'
const dev = {
 app: {
   port: parseInt(process.env.DEV_APP_PORT) || 3000
 },
 db: {
   uri: process.env.DEV_DB_HOST || 'mongodb://localhost:27017/snap-a-doubt',
   
 }
};
const test = {
 app: {
   port: parseInt(process.env.TEST_APP_PORT) || 3000
 },
 db: {
   uri: process.env.TEST_DB_HOST || 'mongodb://localhost:27017/snap-a-doubt',
   
 }
};

const config = {
 dev,
 test
};
module.exports=config[env];