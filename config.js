require('dotenv').load();
const env = process.env.NODE_ENV; // 'dev' or 'test'
const dev = {
 app: {
   port: parseInt(process.env.DEV_APP_PORT) || 3000
 },
 db: {
   uri: process.env.DEV_DB_HOST || 'mongodb://localhost:27017/snap-a-doubt',
   
 },
 aws:{
     bucket:process.env.AWS_BUCKET||'test',
     accessKeyId: process.env.AWS_ACCESSKEY_ID||"AKIAIPPNO6JYKT5SRLNQ",
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY||"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",
	region: process.env.AWS_REGION||"us-west-2"

 }
};
const test = {
 app: {
   port: parseInt(process.env.TEST_APP_PORT) || 3000
 },
 db: {
   uri: process.env.TEST_DB_HOST || 'mongodb://localhost:27017/snap-a-doubt',
   
 },
 aws:{
    bucket:process.env.AWS_BUCKET||'test',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID||"AKIAIPPNO6JYKT5SRLNQ",
   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY||"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",
   region: process.env.AWS_REGION||"us-west-2"

}
};

const config = {
 dev,
 test
};
module.exports=config[env];