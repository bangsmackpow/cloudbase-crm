// Inside your Dashboard component
const [isScanning, setIsScanning] = useState(false);

const handleNewScan = async () => {
  const company = prompt("Enter Business Name:");
  const url = prompt("Enter Website URL:");
  
  if (!company || !url) return;
  
  setIsScanning(true);
  const token = localStorage.getItem('cb_token');
  
  const res = await fetch('https://cloudbase-crm.curtislamasters.workers.dev/api/technical/run-scan', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ companyName: company, url: url })
  });

  if (res.ok) {
    // Refresh the list
    window.location.reload(); 
  }
  setIsScanning(false);
};