
$(document).ready(function() {
  $('#download-timetable-btn').click(function() {
    $.ajax({
      url: 'http://localhost:5004/timetable',
      method: 'GET',
      xhrFields: {
        responseType: 'blob'
      },
      success: function(response) {
        const filename = 'timetable.xlsx';
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          window.navigator.msSaveBlob(blob, filename);
        } else {
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        alert('File downloaded successfully!');
      },
      error: function(error) {
        alert('Error downloading file!');
        console.log(error);
      }
    });
  });
});

function displayTimetable() {
  fetch('http://localhost:5004/timetable')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.arrayBuffer();
    })
    .then(buffer => {
      const data = new Uint8Array(buffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const html = XLSX.utils.sheet_to_html(worksheet);
      document.getElementById('Timetable').innerHTML = html;
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to display timetable');
    });
}
