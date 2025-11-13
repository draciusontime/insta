const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const file = path.join(__dirname, '..', 'data.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function init() {
	await db.read();
	db.data = db.data || { suggestions: [], products: [] };
	await db.write();
}

module.exports = { db, init };
