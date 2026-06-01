import { MongoClient } from 'mongodb';

let cached = global.__mongoClient;

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI tanımlı değil');

  if (!cached) {
    cached = new MongoClient(uri);
    await cached.connect();
    global.__mongoClient = cached;
  }

  const dbName = process.env.MONGODB_DB || 'teknomuallim';
  return cached.db(dbName);
}

export async function getSiteDoc() {
  const db = await getDb();
  return db.collection('site').findOne({ _id: 'main' });
}

export async function saveSiteDoc(partial) {
  const db = await getDb();
  const updatedAt = new Date().toISOString();
  const update = { $set: { ...partial, updatedAt }, $setOnInsert: { _id: 'main' } };
  await db.collection('site').updateOne({ _id: 'main' }, update, { upsert: true });
  return getSiteDoc();
}
