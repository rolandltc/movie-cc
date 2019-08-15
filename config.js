module.exports = {
	base_url: process.env.BASE_URL || 'http://localhost:3000',
	db: {
		host: 'localhost',
		database: 'squarepanda',
		multipleStatements: true,
		user: 'squarepanda',
		password: 'squarepanda'
	},
	env: 'dev', // use either dev or prod
	movie_api: {
		api_key: '79d4eca71520e6b9de3630833a2cc04b',
		base_url: 'http://api.themoviedb.org/3',
	},
	name: 'API',
	port: process.env.PORT || 3000,
};

