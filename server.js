const express = require('express');
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get('/', (req, res) => res.sendFile(__dirname + "/client/index.html"));
app.get('/api', async (req, res) => {

    let x= req.query.lng || 174.904069;
    let y= req.query.lat || -37.012920;
    const response = await fetch(`https://koordinates.com/services/query/v1/vector.json?key=922fbede85634e46900d2ab5b5fb46ee&layer=754&x=${x}&y=${y}&max_results=10&radius=10000&geometry=true`
    );
    const json = await response.json();
    console.log(json)

    if(response.status != 200)
    {
        console.log(response.status)
        console.log("here")

    }
    else
    {
        
        console.log("here")
        length = json['vectorQuery']['layers']['754']['features'].length

        data = {}
        data['place'] = []

        var i;

        for(i = 0; i < length; i++)
        {
            name = json['vectorQuery']['layers']['754']['features'][i]['properties']['Name']
            search = encodeURIComponent(name)
            const response2 = await fetch('https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input='+search+'&inputtype=textquery&fields=name,photos,geometry&key=AIzaSyCj0dZL1s1T30TPvf5II-8HRW-1U6_C9mk'
            );
            const json2 = response2.json();
            console.log(json2)

            img = ''

            if(json2['candidates'] && json2['candidates'].length > 0)
            {
                if(json2['candidates'][0].length > 2)
                {
                    reference = json2['candidates'][0]['photos'][0]['photo_reference']
                    img = ''
                }
            }
            
            data['place'].push({
                'id': json['vectorQuery']['layers']['754']['features'][i]['properties']['NaPALIS_ID'],
                'name': json['vectorQuery']['layers']['754']['features'][i]['properties']['Name'],
                'coords': json['vectorQuery']['layers']['754']['features'][i]['geometry']['coordinates'][0][0],
                'img': ''
            })
        }

        console.log(data)
        console.log("Hello")
        res.send(data)
    }
});

app.listen(PORT, () => console.log(`Example app listening at http://localhost:${PORT}`));