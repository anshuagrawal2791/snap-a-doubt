require('dotenv').load();
const env = process.env.NODE_ENV||'dev'; // 'dev' or 'test'
const dev = {
 app: {
   port: parseInt(process.env.DEV_APP_PORT)||process.env.PORT,
   referralReward1:5,
   referralReward2:2
 },
 db: {
   uri: process.env.DEV_DB_HOST || 'mongodb://localhost:27017/snap-a-doubt',
   
 },
 aws:{
     bucket:process.env.AWS_BUCKET||'dev',
     accessKeyId: process.env.AWS_ACCESSKEY_ID||"AKIAJJM5U5RKUV2DFFHQ",
	  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY||"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",
	  region: process.env.AWS_REGION||"us-west-2"

 }
};


const test = {
 app: {
   port: parseInt(process.env.TEST_APP_PORT) || 8081,
   referralReward1:5,
   referralReward2:2
 },
 db: {
   uri: process.env.TEST_DB_HOST || 'mongodb://localhost:27017/snap-a-doubt',
   
 },
 aws:{
    bucket:process.env.AWS_BUCKET||'test',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID||"AKIAJJM5U5RKUV2DFFHQ",
   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY||"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",
   region: process.env.AWS_REGION||"us-west-2"

}
};



const config = {
 dev,
 test
};
module.exports=config[env];