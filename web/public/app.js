// const API_URL = 'http://localhost:5004/api';
const MQTT_URL = 'http://localhost:5008/send-command';
    
    // Get references to the input and table container elements
    const fileInput = document.getElementById('fileInput');
    const tableContainer = document.getElementById('tableContainer');

    // Listen for file input changes
    fileInput.addEventListener('change', function(event) {
      // Get the selected file
      const selectedFile = event.target.files[0];

      // Read the file using SheetJS
      const reader = new FileReader();
      reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const htmlTable = XLSX.utils.sheet_to_html(sheet);
        tableContainer.innerHTML = `<div class="table-responsive"><table class="table table-striped">${htmlTable}</table></div>`;
      };
      reader.readAsArrayBuffer(selectedFile);
    });

  