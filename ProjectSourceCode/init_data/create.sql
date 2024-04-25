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
    username VARCHAR(50) REFERENCES users(username),
    categoryid INTEGER REFERENCES categories(id),
    subcategoryid INTEGER REFERENCES subcategories(id),
    styleid INTEGER REFERENCES styles(id),
    colorid INTEGER REFERENCES colors(id),
    patternid INTEGER REFERENCES patterns(id),
    imgfile VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS users_to_pieces (
    username VARCHAR(50) NOT NULL REFERENCES users(username),
    pieceid INTEGER NOT NULL REFERENCES pieces(id)
);

CREATE TABLE IF NOT EXISTS fits (
    id SERIAL PRIMARY KEY NOT NULL,
    username VARCHAR(50) REFERENCES users(username),
    fitname VARCHAR(255),
	topid INTEGER REFERENCES pieces(id),
	bottomid INTEGER REFERENCES pieces(id),
	fullbodyid INTEGER REFERENCES pieces(id),
	footwearid INTEGER REFERENCES pieces(id),
	accessoryid INTEGER REFERENCES pieces(id),
	outerwearid INTEGER REFERENCES pieces(id)
);

CREATE TABLE IF NOT EXISTS users_to_fits (
    username VARCHAR(50) NOT NULL REFERENCES users(username),
    fitid INTEGER NOT NULL REFERENCES pieces(id)
);