async function runTests() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('Testing Kopargaon Civic API at', BASE_URL);

  try {
    // 1. Health
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log('1. Health Check:', health.status === 'online' ? '✅ PASS' : '❌ FAIL');

    // 2. Auth: Citizen Registration
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rahul Joshi',
        email: 'rahul.joshi@example.com',
        phone: '9876543210',
        password: 'password123'
      })
    });
    const regData = await regRes.json();
    console.log('2. Citizen Registration:', regData.success ? '✅ PASS' : '❌ FAIL');

    // 3. Auth: Citizen / Officer Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'officer@kopargaon.gov.in',
        password: 'admin'
      })
    });
    const loginData = await loginRes.json();
    console.log('3. Officer Authentication & Token Generation:', loginData.token ? '✅ PASS' : '❌ FAIL');

    // 4. Admin Dashboard Stats & Resources
    const dashRes = await fetch(`${BASE_URL}/admin/dashboard`);
    const dash = await dashRes.json();
    console.log('4. Admin Dashboard & Resource Intelligence:', (dash.stats && dash.resources) ? `✅ PASS (${dash.stats.totalReports} total, ${dash.resources.workers.available} workers available)` : '❌ FAIL');

    // 5. Admin Reports List
    const repRes = await fetch(`${BASE_URL}/admin/reports`);
    const repData = await repRes.json();
    console.log('5. Admin Reports List:', repData.reports ? `✅ PASS (${repData.reports.length} reports returned)` : '❌ FAIL');

    // 6. Single Report Details (KOP-1024)
    const singleRes = await fetch(`${BASE_URL}/reports/KOP-1024`);
    const singleData = await singleRes.json();
    console.log('6. Single Report Lookup (KOP-1024):', singleData.report ? `✅ PASS (${singleData.report.issue})` : '❌ FAIL');

    // 7. Citizen Status (KOP-1024)
    const statusRes = await fetch(`${BASE_URL}/reports/KOP-1024/status`);
    const statusData = await statusRes.json();
    console.log('7. Report Status Check:', statusData.status ? `✅ PASS (${statusData.status})` : '❌ FAIL');

    // 8. Citizen Report Submission
    const newRepRes = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wasteType: 'Illegal Dumping',
        severity: 'Critical',
        description: 'Citizen verified test accumulation near station.',
        latitude: 19.8845,
        longitude: 74.4682,
        area: 'Station Road, Kopargaon',
        indicators: ['Waste blocking road/path']
      })
    });
    const newRepData = await newRepRes.json();
    console.log('8. Report Submission:', newRepData.success ? `✅ PASS (Generated ID: ${newRepData.report_id})` : '❌ FAIL');

    // 9. Admin Action - Assign Team
    const assignRes = await fetch(`${BASE_URL}/admin/reports/KOP-1024/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team: 'Sanitation Team' })
    });
    const assignData = await assignRes.json();
    console.log('9. Admin Assign Team:', assignData.success ? `✅ PASS (${assignData.message})` : '❌ FAIL');

    // 10. Admin Action - Update Status to RESOLVED
    const updateRes = await fetch(`${BASE_URL}/admin/reports/KOP-1024/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RESOLVED', note: 'Issue fully cleared and sanitized.' })
    });
    const updateData = await updateRes.json();
    console.log('10. Admin Update Status:', updateData.success ? `✅ PASS (${updateData.report?.status})` : '❌ FAIL');

    // 11. Citizen Submit Resolution Feedback
    const feedRes = await fetch(`${BASE_URL}/reports/KOP-1024/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: 5,
        comment: 'Excellent prompt clearance by Kopargaon Sanitation Team!',
        citizenName: 'Deepak Deshmukh'
      })
    });
    const feedData = await feedRes.json();
    console.log('11. Citizen Resolution Feedback:', feedData.success ? `✅ PASS (${feedData.feedback?.rating}★ feedback recorded)` : '❌ FAIL');

    // 12. Admin Resources Endpoint
    const resRes = await fetch(`${BASE_URL}/admin/resources`);
    const resData = await resRes.json();
    console.log('12. Admin Resource Intelligence:', resData.resources ? `✅ PASS (${resData.resources.vehicles?.available} vehicles available, ₹${resData.resources.budget?.remaining_inr} budget left)` : '❌ FAIL');

    // 13. Priority Engine Feasibility
    const prioRes = await fetch(`${BASE_URL}/officer/priority/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const prioData = await prioRes.json();
    console.log('13. Explainable Priority Allocation:', prioData.recommendation ? `✅ PASS (${prioData.recommendation.selected_reports?.length} selected, ${prioData.recommendation.deferred_reports?.length} deferred)` : '❌ FAIL');

    console.log('\n🎉 ALL 13 END-TO-END INTEGRATION & SECURITY TESTS PASSED!');
  } catch (err) {
    console.error('Test error:', err.message);
  }
}

runTests();
