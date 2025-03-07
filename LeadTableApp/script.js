// ========== FIREBASE SETUP ========== //
// Replace with your Firebase config (Step 2)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // ========== TABLE FUNCTIONS ========== //
  let activeRow = null;
  
  document.getElementById('newRowBtn').addEventListener('click', () => addNewRow());
  document.getElementById('saveAllBtn').addEventListener('click', saveAllRows);
  
  // Add new row
  function addNewRow(data = {}) {
    const tbody = document.querySelector('#leadTable tbody');
    const newRow = document.createElement('tr');
  
    const html = `
      <td><input type="text" value="${data.firstName || ''}" placeholder="First Name"></td>
      <td><input type="text" value="${data.lastName || ''}" placeholder="Last Name"></td>
      <td><input type="text" value="${data.companyURL || ''}" placeholder="Company URL"></td>
      <td><input type="text" value="${data.linkedinURL || ''}" placeholder="LinkedIn URL"></td>
      <td>
        <select>
          <option value="reached" ${data.leadStatus === 'reached' ? 'selected' : ''}>Reached</option>
          <option value="not reached" ${data.leadStatus === 'not reached' ? 'selected' : ''}>Not Reached</option>
          <option value="do not reach" ${data.leadStatus === 'do not reach' ? 'selected' : ''}>Do Not Reach</option>
          <option value="reach next quarter" ${data.leadStatus === 'reach next quarter' ? 'selected' : ''}>Reach Next Quarter</option>
          <option value="interested" ${data.leadStatus === 'interested' ? 'selected' : ''}>Interested</option>
          <option value="booked" ${data.leadStatus === 'booked' ? 'selected' : ''}>Booked</option>
          <option value="closed" ${data.leadStatus === 'closed' ? 'selected' : ''}>Closed</option>
        </select>
      </td>
      <td><textarea placeholder="Information">${data.information || ''}</textarea></td>
    `;
  
    newRow.innerHTML = html;
    newRow.dataset.docContent = data.docContent || '';
    newRow.addEventListener('click', () => openDocEditor(newRow));
    tbody.appendChild(newRow);
  }
  
  // ========== DOCUMENT EDITOR ========== //
  function openDocEditor(row) {
    activeRow = row;
    const modal = document.getElementById('docModal');
    const content = document.getElementById('docContent');
    modal.style.display = 'block';
    content.innerHTML = row.dataset.docContent || '';
  }
  
  function closeDoc() {
    const modal = document.getElementById('docModal');
    const content = document.getElementById('docContent');
    if (activeRow) {
      activeRow.dataset.docContent = content.innerHTML;
    }
    modal.style.display = 'none';
  }
  
  function formatText(command) {
    document.execCommand(command, false, null);
  }
  
  // ========== DATABASE FUNCTIONS ========== //
  async function saveAllRows() {
    const rows = document.querySelectorAll('#leadTable tbody tr');
    const batch = db.batch();
    const leadsRef = db.collection('leads');
  
    rows.forEach(row => {
      const data = {
        firstName: row.querySelector('input:nth-child(1)').value,
        lastName: row.querySelector('input:nth-child(2)').value,
        companyURL: row.querySelector('input:nth-child(3)').value,
        linkedinURL: row.querySelector('input:nth-child(4)').value,
        leadStatus: row.querySelector('select').value,
        information: row.querySelector('textarea').value,
        docContent: row.dataset.docContent || ''
      };
      batch.set(leadsRef.doc(), data);
    });
  
    await batch.commit();
    alert('All data saved to database!');
  }
  
  // Load data on startup
  window.addEventListener('load', async () => {
    const snapshot = await db.collection('leads').get();
    snapshot.forEach(doc => addNewRow(doc.data()));
  });