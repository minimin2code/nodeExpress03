// #1. Load the required libraries
const express = require('express');
const hbs = require('express-handlebars');
const request = require('request');

//Load application keys
const keys = require('./keys.json');

//#2. Configure the PORT
const PORT = parseInt(process.argv[2] || process.env.APP_PORT || 3000);

//#3. Create an instance of the application
const app = express();

//#4. Route to serve index.html in public directory
app.get(/.*/, express.static(__dirname + '/public'));

//#5. Configure handlebars
app.engine('hbs', hbs());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');


//#6. Start the server
app.listen(PORT, () => {
    console.info(`Application started on port ${PORT} at ${new Date()}`);
});

//#7. Route
app.get('/image', (req, resp) => {  //point to action='image' in served file index.html
    const imgName = req.query.imgName; // retrieve input from name = imgName
    const params = { //specify the parameters u need from API
        q: imgName,
        api_key: keys.giphy, //keys.json file array[giphy]
        limit: 1
    };
    request.get('http://api.giphy.com/v1/gifs/search', //APL get URL
        { qs: params },
        (err, _, body) => {
            if (err) {
                resp.status(400); 
                resp.type('text/plain'); 
                resp.send(err); 
                return;
            }
            const result = JSON.parse(body);
           // const result = body;
           console.log(result);
           //console.log(JSON.parse(body));
            resp.status(200);
            resp.format({
                'text/html': () => {
                    resp.type('text/html');
                    resp.render('image', {  //look up to image.hbs in views directory
                        layout: false,
                        img: imgName.toUpperCase(),
                        dataArray: result.data,
                        pageArray: result.pagination 
                    })
                },
                /*
                'application/json': () => {
                    const respond = {
                        temperature: result.main,
                        coord: result.coord,
                        city: cityName,
                        weather: result.weather.map(v => {
                            return {
                                main: v.main,
                                description: v.description,
                                icon: `http://openweathermap.org/img/w/${v.icon}.png`
                            }
                        })
                    }
                    resp.json(respond)
                },
                */

                'default': () => {
                    resp.status(406);
                    resp.type('text/plain');
                    resp.send(`Cannot produce the requested representation: ${req.headers['accept']}`);
                }
            })
        }
    );
});

