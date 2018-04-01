require('dotenv').load();
const env = process.env.NODE_ENV || 'dev'; // 'dev' or 'test'
const dev = {
  app: {
    port: parseInt(process.env.DEV_APP_PORT) || process.env.PORT,
    referralReward1: 5,
    referralReward2: 2,
    costOfQuestion:1,
    adminKey: process.env.ADMIN_KEY,
    dailySolutionLimit: 10,
    dailyVerificationLimit:10,
    emailId: process.env.EMAIL_ID_DEV,
    emailPassword: process.env.EMAIL_PASSWORD_DEV,
    emailHost:'smtp.gmail.com',
    subjects: ['ENG', 'SST', 'SCI', 'MAT', 'PHY', 'BIO', 'CHE'],
    fcmKey:process.env.FCM_KEY_DEV,
    proxy:false,
    demoBookingMessage:"Booking Confirmed"
    //FIREBASE_CLIENT_ID= process.env.FIREBASE_CLIENT_ID
  },
  db: {
    uri: process.env.DEV_DB_HOST || 'mongodb://localhost:27017/snap-a-doubt'
  },
  aws: {
    bucket: process.env.AWS_BUCKET_DEV || 'dev',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIAJJM5U5RKUV2DFFHQ',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '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',
    region: process.env.AWS_REGION || 'us-west-2',
    bucketBaseUri: process.env.AWS_BUCKET_URL + process.env.AWS_BUCKET_DEV + '/'
  }
};

const test = {
  app: {
    port: parseInt(process.env.TEST_APP_PORT) || 8081,
    referralReward1: 5,
    referralReward2: 2,
    costOfQuestion:1,
    adminKey: 'anshuman',
    dailySolutionLimit: 10,
    dailyVerificationLimit:10,
    emailId: process.env.EMAIL_ID_TEST,
    emailPassword: process.env.EMAIL_PASSWORD_TEST,
    emailHost:'smtp.gmail.com',
    subjects: ['ENG', 'SST', 'SCI', 'MAT', 'PHY', 'BIO', 'CHE'],
    fcmKey:process.env.FCM_KEY_TEST,
    proxy:true,
    demoBookingMessage:"Booking Confirmed"
    //FIREBASE_CLIENT_ID= process.env.FIREBASE_CLIENT_ID
  },
  db: {
    uri: process.env.TEST_DB_HOST || 'mongodb://localhost:27017/snap-a-doubt'

  },
  aws: {
    bucket: process.env.AWS_BUCKET_TEST || 'test',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIAJJM5U5RKUV2DFFHQ',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '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',
    region: process.env.AWS_REGION || 'us-west-2',
    bucketBaseUri: process.env.AWS_BUCKET_URL + process.env.AWS_BUCKET_TEST + '/'

  }
};

const config = {
  dev,
  test
};
module.exports = config[env];
