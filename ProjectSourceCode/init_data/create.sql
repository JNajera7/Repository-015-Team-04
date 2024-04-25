CREATE TABLE IF NOT EXISTS users (
	username VARCHAR(50) PRIMARY KEY NOT NULL,
	password VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
	id SERIAL PRIMARY KEY NOT NULL,
	category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subcategories (
	id SERIAL PRIMARY KEY NOT NULL,
	subcategory TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS styles (
	id SERIAL PRIMARY KEY NOT NULL,
	style TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS colors (
	id SERIAL PRIMARY KEY NOT NULL,
	color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS patterns (
	id SERIAL PRIMARY KEY NOT NULL,
	pattern TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pieces (
    id SERIAL PRIMARY KEY NOT NULL,
    username VARCHAR(255) NOT NULL REFERENCES users(username),
    categoryid INTEGER NOT NULL REFERENCES categories(id),
    subcategoryid INTEGER NOT NULL REFERENCES subcategories(id),
    styleid INTEGER NOT NULL REFERENCES styles(id),
    colorid INTEGER NOT NULL REFERENCES colors(id),
    patternid INTEGER NOT NULL REFERENCES patterns(id),
    imgfile VARCHAR(255) NOT NULL
);