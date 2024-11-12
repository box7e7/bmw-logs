const express = require('express');
const bodyParser = require('body-parser');
const { db1, db2 } = require('./database');
const fs = require('fs').promises
const moment = require('moment');
const jwt = require('jsonwebtoken');
const getAuthTokenUrgently=require("./getAuthToken_export")
const getpayload= require("./getpayload")
const axios = require('axios');
// Import Prisma Client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

const JWT_SECRET=process.env.JWT_SECRET


const app = express();
app.use(bodyParser.json());

let jwt_secret = JWT_SECRET;



// Define the upsertBMW function
async function upsertBMW(id, createData, updateData) {
  const bmw = await prisma.bmw.upsert({
    where: { PO: id }, // Unique identifier to check if the record exists
    create: createData, // Data to create if the record doesn't exist
    update: updateData, // Data to update if the record exists
  });
  return bmw;
}


let drivers_uid_metro = [
  { 'driver_name': 'ABU SALIM SAMER',      'driver_id_towbook': 401438 },
  { 'driver_name': 'SAMER ABU SALIM',      'driver_id_towbook': 401438 },
  { 'driver_name': 'AHMAD MESSAADAH',      'driver_id_towbook': 401436 },
  { 'driver_name': 'Ahmad Masadeh',        'driver_id_towbook': 401436 },
  { 'driver_name': 'Bassam Al Widian',     'driver_id_towbook': 401437 },
  { 'driver_name': 'Billy Johnson',        'driver_id_towbook': 412748 },
  { 'driver_name': 'Demetrius Cornelius',  'driver_id_towbook': 470489 },
  { 'driver_name': 'DRIVER Kamal Kacha',   'driver_id_towbook': 470490 },
  { 'driver_name': 'Kamal Kacha',          'driver_id_towbook': 470490 },
  { 'driver_name': 'Dr Mohanad Yassen',    'driver_id_towbook': 470488 },
  { 'driver_name': 'MOHANAD W YASEEN',     'driver_id_towbook': 470488 },
  { 'driver_name': 'Mohanad Walid',        'driver_id_towbook': 470488 },
  { 'driver_name': 'NAJDAT AFANDE',        'driver_id_towbook': 514287 },
  { 'driver_name': 'Driver Mohanad Walid', 'driver_id_towbook': 470488 },
  { 'driver_name': 'Fayssal Fekair',       'driver_id_towbook': 392043 },
  { 'driver_name': 'Gabriel Trevin Rounds','driver_id_towbook': 401439 },
  { 'driver_name': 'Hamid Messaoud',       'driver_id_towbook': 409326 },
  { 'driver_name': 'Hamzeh Bashaireh',     'driver_id_towbook': 470491 },
  { 'driver_name': 'JAAOUI YOUCEF',        'driver_id_towbook': 403534 },
  { 'driver_name': 'James leonard',        'driver_id_towbook': 401440 },
  { 'driver_name': 'Driver James leonard', 'driver_id_towbook': 401440 },
  { 'driver_name': 'TREVIN ROUNDS',        'driver_id_towbook': 470487 },
  { 'driver_name': 'James Jefferson',      'driver_id_towbook': 538704 },
  { 'driver_name': 'Yazan bashar',         'driver_id_towbook': 538705 },
  { 'driver_name': 'Dementry cloud',       'driver_id_towbook': 538706 },
  { 'driver_name': 'aHMAD   ALNSAIRAT',    'driver_id_towbook': 401439 },
];



let drivers_uid={}
drivers_uid_metro.forEach(el=>{
   
    drivers_uid[el.driver_name.toLowerCase().replace(/\s/g, '')]=el.driver_id_towbook
})

function filterName(name) {
  return name.replace(/\([^)]*\)|\[[^\]]*\]/g, '').toLowerCase().replace(/\s/g, '').trim();
}



async function getActiveJobDetails(po, auth_token) {
  let url = `https://ops-apis.urgent.ly/v3//ops/providers/jobs/${po}/dispatch`;

  try {
    let response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'auth-token': auth_token,
      },
      cache: 'no-cache',
      credentials: 'same-origin',
    });

    let result0 = response.data;
    return result0;
  } catch (error) {
    console.error('Error fetching job details:', error);
    throw error;
  }
}



async function getCaseDetails(casePO, auth_token) {
  let url = `https://ops-apis.urgent.ly/v3/ops/cases/${casePO}`;

  try {
    let response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'auth-token': auth_token,
      },
      cache: 'no-cache',
      credentials: 'same-origin',
    });

    let result0 = response.data;
    return result0;
  } catch (error) {
    console.error('Error fetching job details:', error);
    throw error;
  }
}



async function getJobDetails(po, auth_token) {
  let url = ` https://ops-apis.urgent.ly/v3//ops/jobs/${po}`;

  try {
    let response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'auth-token': auth_token,
      },
      cache: 'no-cache',
      credentials: 'same-origin',
    });

    let result0 = response.data;
    return result0;
  } catch (error) {
    console.error('Error fetching job details:', error);
    throw error;
  }
}


async function getAuthInfo(){
  let auth_token_obj =  await fs.readFile('./cookies.json');
  auth_token=JSON.parse(auth_token_obj)["data"][0]["authToken"]
  console.log("///////////////// auth token //////////////////////\n",auth_token)

  const decoded=getpayload(auth_token)

  const timestampInSeconds = decoded["exp"] // Example timestamp in seconds
  const date = new Date(timestampInSeconds * 1000);
  console.log("///// Token expires on ///////\n",date.toLocaleString());
   
  const currentDate = new Date();
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  
  console.log("////// current time ////////\n",currentDate.toLocaleString('en-US', options));

   // Get the current time in seconds since epoch
   const currentTimestamp = Math.floor(Date.now() / 1000);

   // Compare the timestamps
   if ((timestampInSeconds-300) < currentTimestamp) {
     console.log("Token expired");
     let token=await getAuthTokenUrgently()
     console.log(token)

     const decoded=getpayload(token)

     const timestampInSeconds = decoded["exp"] // Example timestamp in seconds
    const date = new Date(timestampInSeconds * 1000);
    console.log("///// Token expires on ///////\n",date.toLocaleString());
    
    const currentDate = new Date();
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    
    console.log("////// current time ////////\n",currentDate.toLocaleString('en-US', options));

     return token

   }
   else{
    return  auth_token
   } 

  
}

const verifyTokenMiddleware = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  // console.log(req.headers)
  
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    jwt.verify(bearerToken, jwt_secret, (err, authData) => {
      if (err) {
        res.status(403).send({ "error": err });
      } else {
        req.authData = authData;
        next();
      }
    });
  } else {
    res.status(403).send('Unauthorized');
  }
};

app.use((req, res, next) => {
  if (req.path === '/policy') {
    next();
  } else {
    verifyTokenMiddleware(req, res, next);
  }
});


app.get('/', (req, res) => {
  res.send('Welcome to the authenticated route!');
});



app.get('/jobinfo', async (req, res) => {

    const { po_number } = req.query;
    console.log(po_number)

    let job={}
    let token=await getAuthInfo()
    let jobDetails_0=await getJobDetails(po_number,token)

    let casePO=jobDetails_0["data"][0]["caseDTO"]["id"]




    let jobDetails= await getCaseDetails(casePO,token)

    console.log("////// case PO //////",casePO)
    console.log("///// case details //////",jobDetails)
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
  
  //////// get all job details to dispatch job ////////
  try{
      let timestampInMilliSeconds=jobDetails["jobs"][0]["service"]["created"]
      let date = new Date(timestampInMilliSeconds);
      job["createdAt"]=`${date.toLocaleString('en-US', options)}`
      job["PO"]=jobDetails["jobs"][0]["service"]["number"]
      job["casePO"]=jobDetails["jobs"][0]["caseDTO"]["id"]
      job["towFrom"]=jobDetails["jobs"][0]["location"]["address"]
      job["towTo"]=jobDetails["jobs"][0]["dropOffLocation"] ? jobDetails["jobs"][0]["dropOffLocation"]["address"] : null
      job["vehicle"]=jobDetails["jobs"][0]["vehicle"]

      job["contact"]=jobDetails["jobs"][0]["personalInfo"]?.["name"]
      job["phone"]=jobDetails["jobs"][0]["personalInfo"]?.["phone"]
      job["serviceType"]=jobDetails["jobs"][0]["service"]["serviceType"]
      job["provider"]=jobDetails["jobs"][0].provider?.firstName ? jobDetails["jobs"][0].provider : jobDetails_0["data"][0].provider
      job["driverDTO"]=jobDetails["jobs"][0].driverDTO

      // let driverName=`${jobDetails["jobs"][0].provider?.firstName} ${jobDetails["jobs"][0].provider?.lastName}`

      let driverName=`${job["provider"]?.firstName} ${job["provider"]?.lastName}`


      console.log("$$$$$$$",jobDetails["jobs"][0].provider, jobDetails_0["data"][0].provider)

      console.log("%%%%%%%", driverName,filterName(driverName),drivers_uid[filterName(driverName)])
      
      let towbook_id=drivers_uid[filterName(driverName)]
       towbook_id ? job["driverIdTowbook"]=towbook_id : null

      // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
      // console.log("$$$$$$$$$$$$$$$ job extracted $$$$$$$$$$$$$$$$$")
      // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
      // console.log(job)
      // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
      // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
      // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
      
      res.json( job );
    }
    catch(e){
      console.log("//// error catched from job /////",e)
    }

    

  });
  

  app.post('/upsert', async (req, res) => {
    const { job_data } = req.body;
  
    // Extract PO from job_data
    const po_number = parseFloat(job_data?.PO);
  
    if (!po_number || !job_data) {
      return res.status(400).json({ error: 'job_data with PO number is required' });
    }

    const createdAt = job_data.createdAT ? moment(job_data.createdAT).toISOString() : null;

    if (!createdAt) {
      return res.status(400).json({ error: 'Invalid createdAT format; expected ISO-8601 DateTime' });
    }

    // Replace `createdAT` in `job_data` with the properly formatted value
    job_data.createdAT = createdAt;

    // Format `completed` in the "MM/DD/YYYY, hh:mm:ss A" format
    const completed = job_data.createdAT ? moment(job_data.createdAT).format("MM/DD/YYYY, hh:mm:ss A") : null;
    // Replace or set `completed` in `job_data` with the formatted value
    job_data.completed = completed;
  
    try {
      // Define the data for creation and update
      const createData = { ...job_data,  PO: po_number };
      const updateData = { ...job_data , PO: po_number };
  
      // Use the upsertBMW function to upsert data
      const result = await upsertBMW(po_number, createData, updateData);
  
      res.json({ message: 'Upsert successful', data: result });
    } catch (error) {
      console.error('Error in /upsert route:', error);
      res.status(500).json({ error: 'Failed to upsert job' });
    }
  });
  



app.get('/policy', (req, res) => {
  const policyHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Privacy Policy</title>
    </head>
    <body>
      <h1>Privacy Policy</h1>
      <h2>Introduction</h2>
      <p>This Privacy Policy describes how we collect, use, and share information about you when you use our CustomGPT API ("API").</p>
      <h2>Information We Collect</h2>
      <p>We do not capture or intercept any data from your requests to our API. All data is handled securely and is not stored or logged.</p>
      <h2>How We Use Your Information</h2>
      <p>Since we do not capture or store any data, there is no usage of your information beyond processing your immediate request.</p>
      <h2>How We Share Your Information</h2>
      <p>We do not share your information with any third parties as we do not capture or store it.</p>
      <h2>Data Security</h2>
      <p>We implement appropriate security measures to ensure that your data is not captured, intercepted, or stored in any way. However, please be aware that no method of transmission over the internet is completely secure.</p>
      <h2>Your Choices</h2>
      <p>As we do not capture or store any data, there are no choices to be made regarding your information.</p>
      <h2>Changes to This Privacy Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on our website and updating the effective date at the top of this policy.</p>
      <h2>Contact Us</h2>
      <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
      <p>Email: support@kodi.mehdi.cloud</p>
    </body>
    </html>
  `;
  res.send(policyHtml);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
