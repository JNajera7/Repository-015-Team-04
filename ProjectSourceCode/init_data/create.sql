CREATE TABLE IF NOT EXISTS users (
	username VARCHAR(50) PRIMARY KEY NOT NULL,
	password VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS pieces (
	id SERIAL PRIMARY KEY NOT NULL,
	categoryId INTEGER NOT NULL REFERENCES categories,
	subcategoryId INTEGER NOT NULL REFERENCES subcategories,
	styleId INTEGER NOT NULL REFERENCES styles,
	warmthId INTEGER NOT NULL REFERENCES warmths,
	colorId INTEGER NOT NULL REFERENCES colors,
	patternId INTEGER NOT NULL REFERENCES patterns,
	imgFile TEXT NOT NULL,
	name TEXT
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

CREATE TABLE IF NOT EXISTS warmths (
	id SERIAL PRIMARY KEY NOT NULL,
	warmth TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS colors (
	id SERIAL PRIMARY KEY NOT NULL,
	color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS patterns (
	id SERIAL PRIMARY KEY NOT NULL,
	pattern TEXT NOT NULL
);