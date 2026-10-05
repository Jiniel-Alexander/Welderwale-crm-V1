const token = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjYyZjdhYmM3LTkwMTItNDlmNi1hN2U2LWQ5N2YyMjc5M2UxNSJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMWMyNS00ZDAyLWJmMjUtNmFlY2NmN2VhNDE5IiwiaWF0IjoxNzkwOTUyNTAzLCJleHAiOjQ5NDQ1NTI1MDIsImp0aSI6ImQxYzkzYjRhLWFhNzQtNDNhZC05MmM3LTMwMDNiMTU2YjQ2OSJ9.G0BQdPubmU7QVUJdxbAMjGkmp2f_Uwjz2m9_2cUe6WCrNmQe-VdCDQ3NBZzAlvmxw4haZOYdG7D-VHqzdEk0IA';

async function reqMeta(query, variables = {}) {
  const res = await fetch('http://localhost:3000/metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (json.errors) console.error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

async function getObjectIds() {
  const res = await fetch('http://localhost:3000/rest/metadata/objects', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const json = await res.json();
  const map = {};
  if (json.data && json.data.objects) {
    for (const obj of json.data.objects) {
      map[obj.nameSingular] = obj.id;
    }
  }
  return map;
}

async function getFieldIds(objectId) {
  const res = await fetch(`http://localhost:3000/rest/metadata/fields?filter[objectMetadataId][eq]=${objectId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const json = await res.json();
  const map = {};
  if (json.data && json.data.fields) {
    for (const obj of json.data.fields) {
      map[obj.name] = obj.id;
    }
  }
  return map;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  let ids = await getObjectIds();
  const worksiteId = ids.worksite;
  const projectId = ids.project;

  // Function to create field safely
  async function addField(objId, field) {
    const existing = await getFieldIds(objId);
    if (existing[field.name]) {
      console.log(`Field ${field.name} already exists on object ${objId}.`);
      return;
    }
    console.log(`Creating field ${field.name}...`);
    await reqMeta(`
      mutation CreateField($input: CreateOneFieldMetadataInput!) {
        createOneField(input: $input) { id }
      }
    `, { input: { field: { ...field, objectMetadataId: objId } } });
    await sleep(500);
  }

  console.log("Fixing missing Worksite Fields...");
  await addField(worksiteId, { type: "TEXT", name: "siteAddress", label: "Address" });

  console.log("Fixing Project Status...");
  await addField(projectId, { 
    type: "SELECT", name: "projectStatus", label: "Project Status",
    options: [
      { position: 0, label: "DRAFT", value: "DRAFT", color: "gray" },
      { position: 1, label: "PENDING APPROVAL", value: "PENDING_APPROVAL", color: "orange" },
      { position: 2, label: "ACTIVE", value: "ACTIVE", color: "blue" },
      { position: 3, label: "ON HOLD", value: "ON_HOLD", color: "yellow" },
      { position: 4, label: "COMPLETED", value: "COMPLETED", color: "green" },
      { position: 5, label: "CLOSED", value: "CLOSED", color: "gray" },
      { position: 6, label: "CANCELLED", value: "CANCELLED", color: "red" }
    ],
    defaultValue: "'DRAFT'"
  });

  console.log("Done fixing fields!");
}

main().catch(console.error);
