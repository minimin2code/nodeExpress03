const express = require('express');
const hbs = require('express-handlebars');
const request = require('request');

const PORT = parseInt(process.argv[2] || process.env.APP_PORT || 3000);

const key = require('./config.json');

const search = (params) => {
	const p = new Promise((resolve, reject) => {
		request.get('https://api.giphy.com/v1/gifs/search', 
				{ qs: params },
				(err, resp, body) => {
					if (err)
						return reject(err);
					const payload = JSON.parse(body);
					const result = { 
						pagination: payload.pagination,
						urls: []
					}
					result.urls = payload.data.map(i => i.images.downsized_large.url);
					/*
					for (let i of result.data)
						result.urls.push(i.images.downsized_large.url);
					*/
					resolve(result);
				}
		);
	})
	return (p);
}

const app = express();

app.engine('hbs', hbs());
app.set('view engine', 'hbs');

app.get('/search', (req, resp) => {
	const q = req.query.q;
	const count = parseInt(req.query.count) || 10;
	const offset = parseInt(req.query.offset) || 0;

	search({
		q: q, 
		offset: offset, limit: count,
		api_key: key.giphy,
		rating: 'PG'
	}).then(result => {
		console.info('result: ', result.pagination);
		resp.status(200)
		resp.type('text/html')
		resp.render('result', {
			q: q,
			urls: result.urls,
			prev_pg: result.pagination.offset - result.pagination.count ,
			next_pg: result.pagination.offset + result.pagination.count ,
			count: result.pagination.count,
			disable_prev: (offset <= 0)? "disabled": "",
			disable_next: ((offset + count) >= result.pagination.total_count)? "disabled": "",
			layout: false
		});
	}).catch(err => {
		console.error('error: ', err)
		resp.status(400)
		resp.type('text/plain')
		resp.send(err);
	});
})

app.get(/.*/, express.static(__dirname + '/public'))

app.listen(PORT, () => {
	console.info(`Application started at ${new Date()} on port ${PORT}`);
});
