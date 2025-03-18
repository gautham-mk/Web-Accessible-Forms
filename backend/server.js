import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());

app.get('/api/pincode/:pincode', async(req, res) => {
    try{
        const {pincode} = req.params;
        const response = await axios.get(`http://www.postalpincode.in/api/pincode/${pincode}`);

        res.status(200).json(response.data);
    }catch(error){
        res.status(500).json({'error' : 'Error fetching location'});
    }
});

app.listen(5000, () => {
    console.log("server is listening on port 5000");
});