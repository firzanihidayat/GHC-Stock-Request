import { db, json } from './_db.js';
export async function GET() {
 try {
   const {data,error} = await db().from('item').select('item_id,item_name,category,quantity_available').order('item_name');
   if (error) throw error;
   return json({items:data});
 } catch(err) { console.error('Item fetch failed:',err.message); return json({error:'Unable to load items'},500); }
}
