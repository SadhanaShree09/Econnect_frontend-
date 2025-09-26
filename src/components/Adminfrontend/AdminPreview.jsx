import React, { useEffect, useState } from 'react'


export default function AdminPreview({ userId }){
const [uploads, setUploads] = useState([])


useEffect(()=>{ fetchUploads() }, [userId])
async function fetchUploads(){
const res = await fetch(`/assignments/${userId}/uploads`)
const data = await res.json()
setUploads(data.uploads || [])
}


return (
<div className="p-4">
<h2 className="text-lg">Uploads for {userId}</h2>
<div className="grid grid-cols-1 gap-3 mt-3">
{uploads.map(u => (
<div key={u._id} className="p-2 border rounded flex items-center justify-between">
<div>
<div className="font-medium">{u.filename}</div>
<div className="text-xs text-gray-500">Assignment: {u.assignment_id}</div>
</div>
<div>
<a className="px-3 py-1 border rounded" href={`/uploads/${u._id}`} target="_blank" rel="noreferrer">Preview</a>
</div>
</div>
))}
</div>
</div>
)
}