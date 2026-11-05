import { db, json } from './_db.js';
export async function POST(request) {
 try {
  if (!process.env.STAFF_ACCESS_CODE) return json({error:'Staff access code not configured'},503);
  if ((request.headers.get('content-length') || '0') * 1 > 5000) return json({error:'Request too large'},413);
  const contentType=request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return json({error:'JSON required'},415);
  const body=await request.json();
  if (body.website) return json({error:'Invalid request'},400);
  if (typeof body.access_code !== 'string' || body.access_code !== process.env.STAFF_ACCESS_CODE) return json({error:'Invalid staff access code'},403);
  const {item_id,requester_name,requester_email,quantity_requested}=body;
  if (!Number.isSafeInteger(item_id) || item_id<1 || !Number.isSafeInteger(quantity_requested) || quantity_requested<1 || quantity_requested>10000) return json({error:'Invalid item or quantity'},400);
  if (typeof requester_name !== 'string' || requester_name.trim().length<2 || requester_name.length>100) return json({error:'Invalid name'},400);
  if (typeof requester_email !== 'string' || requester_email.length>200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requester_email)) return json({error:'Invalid email'},400);
  const client=db();
  const {data:item,error:findError}=await client.from('item').select('quantity_available').eq('item_id',item_id).maybeSingle();
  if (findError) throw findError;
  if (!item) return json({error:'Item not found'},404);
  if (quantity_requested>item.quantity_available) return json({error:'Quantity exceeds available stock'},400);
  const {data:created,error}=await client.from('stock_request').insert({item_id,requester_name:requester_name.trim(),requester_email:requester_email.trim(),quantity_requested,request_status:'Pending'}).select('request_id').single();
  if (error) throw error;
  return json({request_id:created.request_id,status:'Pending'},201);
 } catch(err) { console.error('Submit request failed:',err.message); return json({error:'Unable to save request'},500); }
}
