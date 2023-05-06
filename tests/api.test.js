const axios = require('axios');
API_URL="http://localhost:5004"

test('should retrieve the most recent booking', () => {
  return axios.get(`${API_URL}/bookings/recent`)
    .then(response => {
      const booking = response.data;
      // Perform assertions on the booking object
      expect(booking).toHaveProperty('lh');
      expect(booking).toHaveProperty('teacherName');
      expect(booking).toHaveProperty('course');
      expect(booking).toHaveProperty('explanation');
      expect(booking).toHaveProperty('pdfFile');
      expect(booking).toHaveProperty('createdDate');
      // Additional assertions on specific properties/values
      expect(booking.lh).toBeDefined();
      expect(booking.teacherName).toBeDefined();
      expect(booking.course).toBeDefined();
      expect(booking.explanation).toBeDefined();
      expect(booking.pdfFile).toBeDefined();
      expect(booking.createdDate).toBeDefined();
    });
});

test('get all users', () => {
  return axios.get(`${API_URL}/users`)
    .then(resp => resp.data)
    .then(users => {
      expect(users.length).toBeGreaterThan(0);
    });
});

test('user login', () => {
  const loginData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123'
  };

  return axios.post(`${API_URL}/login`, loginData)
    .then(resp => resp.data)
    .then(response => {
      expect(response.message).toEqual('User logged in successfully.');
    });
});

// Handle the POST request to /feedback
test('create new feedback', () => {
    const newFeedback = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      message: 'This is a test feedback'
    };
  
    return axios.post(`${API_URL}/feedback`, newFeedback)
      .then(resp => {
        expect(resp.status).toBe(200);
        expect(resp.data).toEqual('Feedback saved');
      });
  });

  test('retrieve all feedback', () => {
    return axios.get(`${API_URL}/feedback`)
      .then(resp => {
        expect(resp.status).toBe(200);
        expect(resp.data).toBeInstanceOf(Array);
      });
  });



  test('retrieve three most recent bookings', () => {
    return axios.get(`${API_URL}/bookings`)
      .then(resp => {
        expect(resp.status).toBe(200);
        expect(resp.data.length).toBe(3); // Expecting three bookings in the response
        // Perform assertions on the bookings if needed
      });
  });

  test('retrieve timetable', () => {
    return axios.get(`${API_URL}/timetable`)
      .then(resp => {
        expect(resp.status).toBe(200);
        expect(resp.headers['content-type']).toEqual('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(resp.headers['content-disposition']).toContain('attachment; filename=timetable.xlsx');
        // Additional assertions on the response data if needed
      });
  });
  
  test('retrieve all bookings', () => {
    return axios.get(`${API_URL}/bookings/all`)
      .then(resp => {
        expect(resp.status).toBe(200);
        expect(resp.data).toBeInstanceOf(Array);
        // Additional assertions on the response data if needed
      });
  });
  
  
  
  
  

  
  


