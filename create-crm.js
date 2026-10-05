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
  console.log("Found objects:", Object.keys(ids).length);
  
  // 1. ORGANIZATION CONTACT (M:N)
  let orgContactId = ids.organizationContact;
  if (!orgContactId) {
    console.log("Creating Organization Contact...");
    const res = await reqMeta(`
      mutation CreateOneObject($input: CreateOneObjectInput!) {
        createOneObject(input: $input) { id nameSingular }
      }
    `, {
      input: { object: {
        nameSingular: "organizationContact", namePlural: "organizationContacts",
        labelSingular: "Organization Contact", labelPlural: "Organization Contacts",
        description: "Join table between Company and Person", icon: "IconUsers"
      } }
    });
    orgContactId = res.createOneObject?.id;
    await sleep(2000);
  }

  // 2. PROJECT
  let projectId = ids.project;
  if (!projectId) {
    console.log("Creating Project...");
    const res = await reqMeta(`
      mutation CreateOneObject($input: CreateOneObjectInput!) {
        createOneObject(input: $input) { id nameSingular }
      }
    `, {
      input: { object: {
        nameSingular: "project", namePlural: "projects",
        labelSingular: "Project", labelPlural: "Projects",
        description: "Construction Project", icon: "IconHammer"
      } }
    });
    projectId = res.createOneObject?.id;
    await sleep(2000);
  }
  
  // 3. APPROVAL HISTORY
  let approvalHistoryId = ids.approvalHistory;
  if (!approvalHistoryId) {
    console.log("Creating Approval History...");
    const res = await reqMeta(`
      mutation CreateOneObject($input: CreateOneObjectInput!) {
        createOneObject(input: $input) { id nameSingular }
      }
    `, {
      input: { object: {
        nameSingular: "approvalHistory", namePlural: "approvalHistories",
        labelSingular: "Approval History", labelPlural: "Approval Histories",
        description: "Governance approval events", icon: "IconCheck"
      } }
    });
    approvalHistoryId = res.createOneObject?.id;
    await sleep(2000);
  }

  // Reload IDs
  ids = await getObjectIds();
  const worksiteId = ids.worksite;
  orgContactId = ids.organizationContact;
  projectId = ids.project;
  approvalHistoryId = ids.approvalHistory;

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

  // WORKSITE FIELDS
  console.log("Adding Worksite Fields...");
  await addField(worksiteId, { type: "RELATION", name: "customer", label: "Customer", relationCreationPayload: { targetObjectMetadataId: ids.company, targetFieldLabel: "Worksites", targetFieldIcon: "IconBuildingCommunity", type: "MANY_TO_ONE" }});
  await addField(worksiteId, { type: "RELATION", name: "siteContact", label: "Site Contact", relationCreationPayload: { targetObjectMetadataId: ids.person, targetFieldLabel: "Worksites", targetFieldIcon: "IconBuildingCommunity", type: "MANY_TO_ONE" }});
  await addField(worksiteId, { type: "TEXT", name: "address", label: "Address" });
  await addField(worksiteId, { type: "TEXT", name: "city", label: "City" });
  await addField(worksiteId, { type: "TEXT", name: "state", label: "State" });
  await addField(worksiteId, { type: "TEXT", name: "pincode", label: "Pincode" });
  await addField(worksiteId, { type: "TEXT", name: "gps", label: "GPS / Location" });
  await addField(worksiteId, { type: "TEXT", name: "deliveryInstructions", label: "Delivery Instructions" });

  // PROJECT FIELDS
  console.log("Adding Project Fields...");
  await addField(projectId, { type: "TEXT", name: "projectCode", label: "Project Code" });
  await addField(projectId, { type: "RELATION", name: "worksite", label: "Worksite", relationCreationPayload: { targetObjectMetadataId: worksiteId, targetFieldLabel: "Projects", targetFieldIcon: "IconHammer", type: "MANY_TO_ONE" }});
  await addField(projectId, { type: "RELATION", name: "projectOwner", label: "Project Owner", relationCreationPayload: { targetObjectMetadataId: ids.workspaceMember, targetFieldLabel: "Managed Projects", targetFieldIcon: "IconUser", type: "MANY_TO_ONE" }});
  await addField(projectId, { type: "RELATION", name: "projectCustomer", label: "Project Customer (Derived)", relationCreationPayload: { targetObjectMetadataId: ids.company, targetFieldLabel: "Projects Derived", targetFieldIcon: "IconHammer", type: "MANY_TO_ONE" }});
  
  // Project Status (Select)
  await addField(projectId, { 
    type: "SELECT", name: "projectStatus", label: "Project Status",
    options: [
      { label: "DRAFT", value: "DRAFT", color: "gray" },
      { label: "PENDING APPROVAL", value: "PENDING_APPROVAL", color: "orange" },
      { label: "ACTIVE", value: "ACTIVE", color: "blue" },
      { label: "ON HOLD", value: "ON_HOLD", color: "yellow" },
      { label: "COMPLETED", value: "COMPLETED", color: "green" },
      { label: "CLOSED", value: "CLOSED", color: "gray" },
      { label: "CANCELLED", value: "CANCELLED", color: "red" }
    ],
    defaultValue: "DRAFT"
  });

  // ORG CONTACT FIELDS
  console.log("Adding Org Contact Fields...");
  await addField(orgContactId, { type: "RELATION", name: "organization", label: "Organization", relationCreationPayload: { targetObjectMetadataId: ids.company, targetFieldLabel: "Organization Contacts", targetFieldIcon: "IconUsers", type: "MANY_TO_ONE" }});
  await addField(orgContactId, { type: "RELATION", name: "contact", label: "Contact", relationCreationPayload: { targetObjectMetadataId: ids.person, targetFieldLabel: "Organization Contacts", targetFieldIcon: "IconUsers", type: "MANY_TO_ONE" }});

  // APPROVAL HISTORY FIELDS
  console.log("Adding Approval History Fields...");
  await addField(approvalHistoryId, { type: "RELATION", name: "project", label: "Project", relationCreationPayload: { targetObjectMetadataId: projectId, targetFieldLabel: "Approval History", targetFieldIcon: "IconCheck", type: "MANY_TO_ONE" }});
  await addField(approvalHistoryId, { type: "RELATION", name: "approver", label: "Approver", relationCreationPayload: { targetObjectMetadataId: ids.workspaceMember, targetFieldLabel: "Approvals Made", targetFieldIcon: "IconUser", type: "MANY_TO_ONE" }});
  await addField(approvalHistoryId, { type: "TEXT", name: "action", label: "Action (e.g. APPROVED, REJECTED)" });
  await addField(approvalHistoryId, { type: "TEXT", name: "comments", label: "Comments" });
  
  console.log("Done scaffolding Construction CRM Objects and Fields!");
}

main().catch(console.error);
